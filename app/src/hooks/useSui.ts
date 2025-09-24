import { useCurrentAccount, useSuiClient, useSignTransaction } from '@mysten/dapp-kit';

import { Transaction } from '@mysten/sui/transactions';
import { toBase64 } from '@mysten/sui/utils';
import axios from 'axios';

export const useSui = () => {
  const currentAccount = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const address = currentAccount?.address;

  const executeSignedTransactionBlock = async ({ signedTx, requestType, options }: any) => {
    const result = await client.executeTransactionBlock({
      transactionBlock: signedTx.transactionBlockBytes,
      signature: signedTx.signature,
      ...(options && { options }),
    });

    await client.waitForTransaction({ digest: result.digest, timeout: 10_000 });
    return result;
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
      transactionKindBytes: toBase64(txBytes),
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

  return { executeSignedTransactionBlock, enokiSponsorExecute, client };
};
