import { useGetBalance } from '../../hooks/useGetBalance';
import { Coin } from '../../icons/tsx/Coin';
import { useFaucet } from '../../hooks/useFaucet';
import { BallTriangle } from 'react-loader-spinner';
import { useConfig } from "../../hooks/useConfig";
import { MIST_PER_SUI } from '@mysten/sui/utils';
import { useCurrentAccount } from '@mysten/dapp-kit';

export const Balance = () => {
    const { balance, address: balanceAddress, isLoading: balanceLoading, isError } = useGetBalance();
    const { requestSui, isLoading } = useFaucet();
    const { GAME_BALANCE } = useConfig({});
    const currentAccount = useCurrentAccount();

    // Try to get address from multiple sources
    const address = balanceAddress || currentAccount?.address;

    // Show balance component if we have any connected account, even if address is null
    const showBalance = address || currentAccount;

    if (!showBalance) {
        return null;
    }

    return (
        <div className="flex items-center space-x-4">
            {balanceLoading && (
                <div className="flex items-center justify-center space-x-2 rounded-full border-2 border-solid border-gray-700 px-5 py-3">
                    <BallTriangle width={25} height={25} color="#FFD600" />
                    <div className="font-bold">Loading...</div>
                </div>
            )}

            {!balanceLoading && balance > 0 && (
                <div className="flex items-center justify-center space-x-2 rounded-full border-2 border-solid border-gray-700 px-5 py-3">
                    <Coin color="#FFD600" />
                    <div className="font-bold">{balance} SUI</div>
                </div>
            )}

            {!balanceLoading && (isError || !address || balance < +GAME_BALANCE / Number(MIST_PER_SUI)) && (
                <div className="flex items-center justify-center space-x-2 rounded-full border-2 border-solid border-gray-700 px-5 py-3">
                    {!isLoading && <Coin color="#FFD600" />}
                    {!isLoading && (
                        <button
                            onClick={requestSui}
                            className="font-bold hover:cursor-pointer bg-transparent border-none text-inherit"
                        >
                            {isError || !address ? 'Get SUI' : 'Request SUI'}
                        </button>
                    )}
                    {isLoading && (
                        <>
                            <BallTriangle width={25} height={25} color="#FFD600" />
                            <div className="font-bold">Requesting...</div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
