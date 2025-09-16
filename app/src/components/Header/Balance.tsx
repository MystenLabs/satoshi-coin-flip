import { useGetBalance } from '../../hooks/useGetBalance';
import { Coin } from '../../icons/tsx/Coin';
import { useFaucet } from '../../hooks/useFaucet';
import { BallTriangle } from 'react-loader-spinner';
// import { Button } from '../General/Button';
// import { TransactionBlock } from '@mysten/sui.js/transactions';
// import { useSui } from '../../hooks/useSui';

export const Balance = () => {
    const { balance, address } = useGetBalance();
    const { requestSui, isLoading } = useFaucet();
    // const { enokiExecute } = useSui();

    // const sendSUI = async () => {
    //     const tx = new TransactionBlock();
    //     const coin = tx.splitCoins(tx.gas, [tx.pure(10000000)]);
    //     tx.transferObjects(
    //         [coin],
    //         tx.pure('0xbd439523283f434aaf0b3b7eb67c2836bb75fb2fa25f4beec0374cf93d949fed'),
    //     );
    //     await enokiExecute({
    //         transactionBlock: tx,
    //         requestType: 'WaitForLocalExecution',
    //         options: {},
    //     });
    //     reFetchData();
    // };

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
            {/* <Button onClick={sendSUI}>click meh</Button> */}
        </>
    );
};
