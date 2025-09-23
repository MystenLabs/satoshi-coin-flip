import { ReactElement, useEffect, useState, useMemo, useCallback } from 'react';
import { BalanceContext } from './BalanceContext';
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
            console.log('BalanceProvider: Address changed, fetching balance for:', address);
            reFetchData();
        } else {
            console.log('BalanceProvider: No address, resetting balance');
            setBalance(0);
            setIsLoading(false);
            setisError(false);
        }
    }, [address, client, COIN_TYPE]);

    const reFetchData = useCallback(async () => {
        if (!address) {
            console.log('BalanceProvider: No address available for fetch');
            return;
        }

        setIsLoading(true);
        console.log('BalanceProvider: Starting balance fetch for address:', address);
        console.log('BalanceProvider: Using COIN_TYPE:', COIN_TYPE);

        try {
            const res = await client.getAllCoins({
                owner: address,
            });

            console.log('BalanceProvider: getAllCoins response:', res);
            setCoinArray(res.data);
            const coins = res.data.filter(({ coinType }) => coinType === COIN_TYPE);
            console.log('BalanceProvider: Filtered coins for COIN_TYPE:', coins);
            const sum = coins.reduce(
                (acc, { balance }) => BigNumber(balance).plus(acc),
                BigNumber(0),
            );
            console.log('BalanceProvider: Sum before division:', sum.toString());
            let total = sum.dividedBy(1e9);
            let formatedTotal = formatAmount(total);
            console.log('BalanceProvider: Formatted total:', formatedTotal);
            setBalance(+formatedTotal);
            setIsLoading(false);
            setisError(false);
        } catch (err) {
            console.error('BalanceProvider: Error fetching balance:', err);
            setIsLoading(false);
            setisError(true);
        }
    }, [address, client, COIN_TYPE]);

    const getCoin = (amount: number) => {
        let coin = coinArray.find((coin) => +coin.balance >= amount);
        return coin?.coinObjectId;
    };

    const getAllCoinsAsTxArgs = (tx: Transaction) => {
        return coinArray.map((coin) => tx.object(coin.coinObjectId));
    };

    const contextValue = useMemo(() => ({
        balance,
        isLoading,
        isError,
        reFetchData,
        getCoin,
        getAllCoinsAsTxArgs,
        address,
    }), [balance, isLoading, isError, reFetchData, address]);

    return (
        <BalanceContext.Provider value={contextValue}>
            {children}
        </BalanceContext.Provider>
    );
};
