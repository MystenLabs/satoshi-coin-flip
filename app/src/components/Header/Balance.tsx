import { useGetBalance } from '../../hooks/useGetBalance';
import { Coin } from '../../icons/tsx/Coin';
import { useFaucet } from '../../hooks/useFaucet';
import { BallTriangle } from 'react-loader-spinner';
import { useConfig } from "../../hooks/useConfig";
import { MIST_PER_SUI } from '@mysten/sui/utils';
import { useCurrentAccount } from '@mysten/dapp-kit';

export const Balance = () => {
    const { balance, address: balanceAddress, isLoading: balanceLoading, isError } = useGetBalance();
    const { requestSui, isLoading, isEnokiConnected } = useFaucet();
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
                    <div className="font-bold">{balance.toFixed(2)} SUI</div>
                </div>
            )}

            {!balanceLoading && (isError || !address || balance < +GAME_BALANCE / Number(MIST_PER_SUI)) && (
                <div className="flex items-center justify-center space-x-2 rounded-full border-2 border-solid border-gray-700 px-5 py-3">
                    {!isLoading && <Coin color="#FFD600" />}
                    {!isLoading && isEnokiConnected && (
                        <button
                            onClick={requestSui}
                            className="font-bold hover:cursor-pointer bg-transparent border-none text-inherit"
                        >
                            {isError || !address ? 'Get SUI' : 'Request SUI'}
                        </button>
                    )}
                    {!isLoading && !isEnokiConnected && (
                        <div
                            className="font-bold text-gray-400 cursor-not-allowed relative group"
                            title="Temporarily unavailable, send testnet SUI directly to your address from the Slush wallet"
                        >
                            Get SUI
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                Temporarily unavailable, send testnet SUI directly to your address from the Slush wallet
                            </div>
                        </div>
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
