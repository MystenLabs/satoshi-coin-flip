import { useSuiClient } from '@mysten/dapp-kit';


export const useSui = () => {
    const client = useSuiClient();

    const executeSignedTransactionBlock = async ({ signedTx, requestType, options }: any) => {
        let { digest } = await client.executeTransactionBlock({
            transactionBlock: signedTx.transactionBlockBytes,
            signature: signedTx.signature,
            ...(options && { options }),
        });
        await client.waitForTransaction({digest})
    };

    return { executeSignedTransactionBlock, client };
};
