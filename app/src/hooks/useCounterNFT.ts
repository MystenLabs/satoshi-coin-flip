// import { useWalletKit } from '@mysten/wallet-kit';
import { useEffect, useState } from 'react';
import { useSui } from './useSui';
import { useZkLogin } from '@mysten/enoki/react';
import { PaginatedObjectsResponse, SuiObjectResponse } from '@mysten/sui.js/client';
import { useConfig } from './useConfig';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import toast from 'react-hot-toast';

export const useGetCounterNFT = () => {
    const { PACKAGE_ID } = useConfig({});
    const { address } = useZkLogin();
    const { client, enokiSponsorExecute } = useSui();

    const [data, setData] = useState<SuiObjectResponse[]>([]);
    const [counterNFT, setCounterNFT] = useState<any | null>(null); // data[0
    const [fetchLoading, setFetchLoading] = useState(false);
    const [creationLoading, setCreationLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (!!address) {
            reFetchData();
        } else {
            setData([]);
            setFetchLoading(false);
            setIsError(false);
        }
    }, [address]);

    const reFetchData = async () => {
        setFetchLoading(true);
        client
            .getOwnedObjects({
                owner: address!,
                filter: {
                    StructType: `${PACKAGE_ID}::counter_nft::Counter`,
                },
                options: {
                    showContent: true,
                },
            })
            .then((res: PaginatedObjectsResponse) => {
                if (res.hasNextPage) {
                    // does not abort since it could still handle this request
                    console.error('This is a paginated response and is not supported yet.');
                }
                // console.log('[useGetCounterNFT]', res);
                if (res.data.length >= 1) {
                    setCounterNFT(res.data[0].data?.objectId);
                }
                setData(res.data);
                setFetchLoading(false);
                setIsError(false);
            })
            .catch((err: any) => {
                console.log(err);
                setData([]);
                setFetchLoading(false);
                setIsError(true);
            });
    };

    const mintCounterNFT = async () => {
        setCreationLoading(true);
        try {
            const tx = new TransactionBlock();
            let counter = tx.moveCall({
                target: `${PACKAGE_ID}::counter_nft::mint`,
            });

            tx.moveCall({
                target: `${PACKAGE_ID}::counter_nft::transfer_to_sender`,
                arguments: [counter],
            });

            const txRes = await enokiSponsorExecute({ transactionBlock: tx });
            const effects = await client.getTransactionBlock({
                digest: txRes.digest,
                options: {
                    showEffects: true,
                },
            });
            // console.log('effects', effects);
            if (effects.effects?.status.status === 'success') {
                setCounterNFT(effects.effects.created?.[0].reference.objectId);
                toast.success('Counter NFT created!');
            } else {
                throw new Error('Failed to mint counter NFT');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCreationLoading(false);
        }
    };

    const burnCounterNFT = async () => {
        setCreationLoading(true);
        try {
            const tx = new TransactionBlock();
            tx.moveCall({
                target: `${PACKAGE_ID}::counter_nft::burn`,
                arguments: [tx.object(counterNFT)],
            });

            const txRes = await enokiSponsorExecute({ transactionBlock: tx });
            const effects = await client.getTransactionBlock({
                digest: txRes.digest,
                options: {
                    showEffects: true,
                },
            });
            // console.log('burn effects', effects);
            if (effects.effects?.status.status === 'success') {
                setCounterNFT(null);
            } else {
                throw new Error('Failed to burn counter NFT');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCreationLoading(false);
        }
    };

    return {
        mintCounterNFT,
        burnCounterNFT,
        counterNFT,
        data,
        fetchLoading,
        creationLoading,
        isError,
        reFetchData,
        address,
    };
};
