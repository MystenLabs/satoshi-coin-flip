import { ReactElement, useEffect, useState } from 'react';
import { BalanceContext } from './BalanceContext';
// import { useWalletKit } from '@mysten/wallet-kit';
import { useSui } from '../../hooks/useSui';
import { useConfig } from '../../hooks/useConfig';
import BigNumber from 'bignumber.js';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { formatAmount } from '../../utils/formatAmount';
import { CoinStruct } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

interface BalanceProviderProps {
    children: ReactElement | ReactElement[];
}

export const BalanceProvider = ({ children }: BalanceProviderProps) => {
    const currentAccount = useCurrentAccount();
    const address = currentAccount?.address;
    const { client } = useSui();
    const { COIN_TYPE } = useConfig({});

    const [balance, setBalance] = useState<number>(0);
    const [coinArray, setCoinArray] = useState<CoinStruct[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setisError] = useState<boolean>(false);

    useEffect(() => {
        if (address) {
            reFetchData();
        } else {
            setBalance(0);
            setIsLoading(false);
            setisError(false);
        }
    }, [address]);

    const reFetchData = async () => {
        setIsLoading(true);
        client
            .getAllCoins({
                owner: address!,
            })
            .then((res) => {
                // console.log(res);
                setCoinArray(res.data);
                const coins = res.data.filter(({ coinType }) => coinType === COIN_TYPE);
                const sum = coins.reduce(
                    (acc, { balance }) => BigNumber(balance).plus(acc),
                    BigNumber(0),
                );
                let total = sum.dividedBy(1e9);
                let formatedTotal = formatAmount(total);
                // console.log('Refetch Total:', formatedTotal);
                setBalance(+formatedTotal);
                setIsLoading(false);
                setisError(false);
            })
            .catch((err) => {
                console.log(err);
                setIsLoading(false);
                setisError(true);
            });
    };

    const getCoin = (amount: number) => {
        let coin = coinArray.find((coin) => +coin.balance >= amount);
        return coin?.coinObjectId;
    };

    const getAllCoinsAsTxArgs = (tx: Transaction) => {
        return coinArray.map((coin) => tx.object(coin.coinObjectId));
    };

    return (
        <BalanceContext.Provider
            value={{
                balance,
                isLoading,
                isError,
                reFetchData,
                getCoin,
                getAllCoinsAsTxArgs,
                address,
            }}
        >
            {children}
        </BalanceContext.Provider>
    );
};
