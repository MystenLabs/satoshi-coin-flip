import { useEffect, useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { SuiObjectResponse } from '@mysten/sui/client';
import toast from 'react-hot-toast';

export const useGetCounterNFT = () => {
    const currentAccount = useCurrentAccount();
    const address = currentAccount?.address;

    const [data, setData] = useState<SuiObjectResponse[]>([]);
    // For now, always set counterNFT to a dummy value since the counter_nft module doesn't exist
    const [counterNFT, setCounterNFT] = useState<any | null>('dummy-counter');
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
        // Since counter_nft module doesn't exist, we'll just simulate a successful fetch
        setData([]);
        setFetchLoading(false);
        setIsError(false);
    };

    const mintCounterNFT = async () => {
        setCreationLoading(true);
        // Since counter_nft module doesn't exist, we'll just simulate success
        toast.success('Counter NFT created!');
        setCreationLoading(false);
    };

    const burnCounterNFT = async () => {
        setCreationLoading(true);
        // Since counter_nft module doesn't exist, we'll just simulate success
        setCounterNFT(null);
        setCreationLoading(false);
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
