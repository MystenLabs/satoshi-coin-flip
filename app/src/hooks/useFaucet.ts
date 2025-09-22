import axios from 'axios';
import { useConfig } from './useConfig';
import { useWallets } from '@mysten/dapp-kit';
import { useGetBalance } from './useGetBalance';
import { useState, useEffect } from 'react';
import { useSui } from './useSui';
import { isEnokiWallet, EnokiWallet, getSession, AuthProvider } from '@mysten/enoki';

export const useFaucet = () => {
    const { FAUCET_API, ENOKI_API_KEY } = useConfig({});
    const { client } = useSui();
    const { reFetchData } = useGetBalance();
    const [isLoading, setIsLoading] = useState(false);
    const [jwt, setJwt] = useState<string | null>(null);
    const url = `${FAUCET_API}/api/faucet`;

    const wallets = useWallets().filter(isEnokiWallet);

    useEffect(() => {
        let active = true;

        (async () => {
            try {
                const walletsByProvider = wallets.reduce<Map<AuthProvider, EnokiWallet>>(
                    (map, wallet) => {
                        map.set(wallet.provider, wallet);
                        return map;
                    },
                    new Map<AuthProvider, EnokiWallet>()
                );

                const googleWallet = walletsByProvider.get('google');
                if (!googleWallet) {
                    if (active) setJwt(null);
                    return;
                }

                const session = await getSession(googleWallet);
                if (active) {
                    setJwt(session?.jwt ?? null);
                }
            } catch (err) {
                console.error('Failed to load Enoki session', err);
                if (active) setJwt(null);
            }
        })();

        return () => {
            active = false;
        };
    }, [wallets]);

    const requestSui = async () => {
        if (!jwt) {
            throw new Error('Missing login session; please sign in again.');
        }

        setIsLoading(true);
        try {
            const resp = await axios.get(url, {
                headers: {
                    'Enoki-api-key': ENOKI_API_KEY,
                    Authorization: `Bearer ${jwt}`,
                },
            });
            await client.waitForTransaction({ digest: resp.data.txDigest, timeout: 10_000 });
            reFetchData();
        } catch (err) {
            console.error('Faucet error:', err);
            return Promise.reject(new Error('Faucet limitation reached. Try again later.'));
        } finally {
            setIsLoading(false);
        }
        return Promise.resolve();
    };

    return { requestSui, isLoading };
};
