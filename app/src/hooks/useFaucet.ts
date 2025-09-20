import axios from 'axios';
import { useConfig } from './useConfig';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useGetBalance } from './useGetBalance';
import { useState } from 'react';
import { useSui } from './useSui';

export const useFaucet = () => {
    const { FAUCET_API, ENOKI_API_KEY } = useConfig({});
    const { client } = useSui();
    const currentAccount = useCurrentAccount();
    const { reFetchData } = useGetBalance();
    const [isLoading, setIsLoading] = useState(false);
    const url = `${FAUCET_API}/api/faucet`;

    const requestSui = async () => {
        if (!currentAccount) throw new Error('No account connected');
        setIsLoading(true);
        try {
            const resp = await axios.get(url, {
                headers: {
                    'Enoki-api-key': ENOKI_API_KEY,
                    Authorization: `Bearer ${currentAccount?.address}`,
                },
            });
            // console.log('Faucet response:', resp.data);
            await client.waitForTransaction({ digest: resp.data.txDigest, timeout: 10_000 });
            reFetchData();
        } catch (err) {
            console.error('Faucet error:', err);
            return Promise.reject('Something bad happened with the faucet');
        } finally {
            setIsLoading(false);
        }
        return Promise.resolve();
    };

    return { requestSui, isLoading };
};
