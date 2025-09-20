// import {
//     ExecuteTransactionRequestType,
//     SignedTransaction,
//     SuiTransactionBlockResponseOptions,
// } from '@mysten/sui.js';

import {
    ExecuteTransactionRequestType,
    SuiTransactionBlockResponseOptions,
} from '@mysten/sui/client';
import { useCurrentAccount, useSuiClient, useSignTransaction } from '@mysten/dapp-kit';

import { useConfig } from './useConfig';
import { Transaction } from '@mysten/sui/transactions';
import { fromB64, toB64 } from '@mysten/sui/utils';
import axios from 'axios';

interface ExecuteSignedTransactionBlockProps {
    signedTx: any;
    requestType: any;
    options?: any;
}

export const useSui = () => {
    const { API_BASE_URL } = useConfig({});
    const currentAccount = useCurrentAccount();
    const client = useSuiClient();
    const { mutateAsync: signTransaction } = useSignTransaction();
    const address = currentAccount?.address;

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
        transactionBlock: Transaction;
    }) => {
        if (!address) {
            throw new Error('No address found');
        }

        transactionBlock.setSender(address);
        const txBytes = await transactionBlock.build({ client, onlyTransactionKind: true });

        // Create sponsored transaction via our new Enoki endpoint
        const createSponsoredTransactionResp = await axios.post('/api/sponsor/prepare', {
            transactionKindBytes: toB64(txBytes),
            sender: address,
        });
        const { bytes, digest }: { bytes: string; digest: string } =
            createSponsoredTransactionResp.data;

        // Sign the sponsored transaction
        const { signature } = await signTransaction({
            transaction: bytes,
        });

        // Execute the sponsored transaction
        const executeSponsoredTransactionResp = await axios.post('/api/sponsor/execute', {
            digest,
            signature,
        });

        const { digest: txDigest } = executeSponsoredTransactionResp.data;
        await client.waitForTransaction({ digest: txDigest, timeout: 10_000 });
        return { digest: txDigest };
    };

    const enokiExecute = async ({
        transactionBlock,
        requestType,
        options,
    }: {
        transactionBlock: Transaction;
        requestType: ExecuteTransactionRequestType;
        options: SuiTransactionBlockResponseOptions;
    }) => {
        if (!address) {
            throw new Error('No address found');
        }

        const { signature } = await signTransaction({
            transaction: transactionBlock,
        });

        return client.executeTransactionBlock({
            transactionBlock: await transactionBlock.build({ client }),
            signature,
            requestType,
            ...(options && { options }),
        });
    };

    return { executeSignedTransactionBlock, enokiSponsorExecute, enokiExecute, client };
};
