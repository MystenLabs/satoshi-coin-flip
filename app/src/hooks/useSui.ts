// import {
//     ExecuteTransactionRequestType,
//     SignedTransaction,
//     SuiTransactionBlockResponseOptions,
// } from '@mysten/sui.js';

import {
    ExecuteTransactionRequestType,
    RPCTransactionRequestParams,
    SuiClient,
    SuiTransactionBlockResponseOptions,
    SuiTransactionBlockResponseQuery,
} from '@mysten/sui.js/client';
// import { ExecuteTransactionRequestType } from '@mysten/sui.js/transactions';
import { useEnokiFlow, useZkLogin } from '@mysten/enoki/react';

import { useConfig } from './useConfig';
import { TransactionBlock } from '@mysten/sui.js/transactions/';
import { fromB64, toB64 } from '@mysten/sui.js/utils';
import axios from 'axios';

interface ExecuteSignedTransactionBlockProps {
    signedTx: any;
    requestType: any;
    options?: any;
}

export const useSui = () => {
    const { FULL_NODE, API_BASE_URL } = useConfig({});
    const enokiFlow = useEnokiFlow();
    const { address } = useZkLogin();

    const client = new SuiClient({ url: FULL_NODE });

    const executeSignedTransactionBlock = async ({ signedTx, requestType, options }: any) => {
        return client.executeTransactionBlock({
            transactionBlock: signedTx.transactionBlockBytes,
            signature: signedTx.signature,
            requestType,
            ...(options && { options }),
        });
    };

    const enokiSponsorExecute = async ({
        transactionBlock,
    }: {
        transactionBlock: TransactionBlock;
    }) => {
        transactionBlock.setSender(address!);
        const txBytes = await transactionBlock.build({ client, onlyTransactionKind: true });
        const createSponsoredTransactionResp = await axios.post(`${API_BASE_URL}/sponsor/create`, {
            bytes: toB64(txBytes),
            sender: address,
        });
        const { bytes, digest }: { bytes: string; digest: string } =
            createSponsoredTransactionResp.data;
        const signer = await enokiFlow.getKeypair({ network: 'testnet' });
        const { signature } = await signer.signTransactionBlock(fromB64(bytes));
        const executeSponsoredTransactionResp = await axios.post(
            `${API_BASE_URL}/sponsor/execute`,
            {
                digest,
                signature,
            },
        );
        const { digest: txDigest } = executeSponsoredTransactionResp.data;
        await client.waitForTransactionBlock({ digest, timeout: 10_000 });
        return { digest: txDigest };
    };

    const enokiExecute = async ({
        transactionBlock,
        requestType,
        options,
    }: {
        transactionBlock: TransactionBlock;
        requestType: ExecuteTransactionRequestType;
        options: SuiTransactionBlockResponseOptions;
    }) => {
        const keypair = await enokiFlow.getKeypair();
        // console.log('address', keypair.toSuiAddress());
        return client.signAndExecuteTransactionBlock({
            transactionBlock: transactionBlock,
            signer: keypair,
            requestType,
            ...(options && { options }),
        });
    };

    return { executeSignedTransactionBlock, enokiSponsorExecute, enokiExecute, client };
};
