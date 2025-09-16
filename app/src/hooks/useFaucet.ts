import axios from 'axios';
import { useConfig } from './useConfig';
import { useZkLoginSession } from '@mysten/enoki/react';
import { useGetBalance } from './useGetBalance';
import { useState } from 'react';
import { useSui } from './useSui';

export const useFaucet = () => {
    const { FAUCET_API, ENOKI_API_KEY } = useConfig({});
    const { client } = useSui();
    const session = useZkLoginSession();
    const { reFetchData } = useGetBalance();
    const [isLoading, setIsLoading] = useState(false);
    const url = `${FAUCET_API}/api/faucet`;

    const requestSui = async () => {
        if (!session?.jwt) throw new Error('No session found');
        setIsLoading(true);
        try {
            const resp = await axios.get(url, {
                headers: {
                    'Enoki-api-key': ENOKI_API_KEY,
                    Authorization: `Bearer ${session?.jwt}`,
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
