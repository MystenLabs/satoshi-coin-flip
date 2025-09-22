import { useGetBalance } from '../../hooks/useGetBalance';
import { Coin } from '../../icons/tsx/Coin';
import { useFaucet } from '../../hooks/useFaucet';
import { BallTriangle } from 'react-loader-spinner';

export const Balance = () => {
    const { balance, address } = useGetBalance();
    const { requestSui, isLoading } = useFaucet();

    if (!address) return null;
    return (
        <>
            {balance > 0 && (
                <div className="flex items-center justify-center space-x-2 rounded-full border-2 border-solid border-gray-700 px-5 py-3">
                    <Coin color="#FFD600" />
                    <div className="font-bold">{balance} SUI</div>
                </div>
            )}

            {balance == 0 && (
                <div className="flex items-center justify-center space-x-2 rounded-full border-2 border-solid border-gray-700 px-5 py-3">
                    <Coin color="#FFD600" />
                    {!isLoading && (
                        <div onClick={requestSui} className="font-bold hover:cursor-pointer">
                            Request SUI
                        </div>
                    )}
                    {isLoading && <BallTriangle width={25} height={25} color="#FFD600" />}
                </div>
            )}
        </>
    );
};
