import { useGetBalance } from '../../hooks/useGetBalance';
import { Coin } from '../../icons/tsx/Coin';
import { useFaucet } from '../../hooks/useFaucet';
import { BallTriangle } from 'react-loader-spinner';
import { useConfig } from "../../hooks/useConfig";
import { MIST_PER_SUI } from '@mysten/sui/utils';

export const Balance = () => {
    const { balance, address } = useGetBalance();
    const { requestSui, isLoading } = useFaucet();
  const { GAME_BALANCE } = useConfig({});

    if (!address) return null;

    return (
        <div className="flex items-center space-x-4">
            {balance > 0 && (
                <div className="flex items-center justify-center space-x-2 rounded-full border-2 border-solid border-gray-700 px-5 py-3">
                    <Coin color="#FFD600" />
                    <div className="font-bold">{balance} SUI</div>
                </div>
            )}

            {balance < +GAME_BALANCE / Number(MIST_PER_SUI) && (
                <div className="flex items-center justify-center space-x-2 rounded-full border-2 border-solid border-gray-700 px-5 py-3">
                    {!isLoading && <Coin color="#FFD600" />}
                    {!isLoading && (
                        <button
                            onClick={requestSui}
                            className="font-bold hover:cursor-pointer bg-transparent border-none text-inherit"
                        >
                            Request SUI
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
