import axios from 'axios';
import { useConfig } from './useConfig';
import { useWallets, useCurrentAccount } from '@mysten/dapp-kit';
import { useGetBalance } from './useGetBalance';
import { useState, useEffect } from 'react';
import { useSui } from './useSui';
import { isEnokiWallet, EnokiWallet, getSession, AuthProvider } from '@mysten/enoki';

export const useFaucet = () => {
    const { FAUCET_API, ENOKI_API_KEY, FULL_NODE } = useConfig({});
    const { client } = useSui();
    const { reFetchData } = useGetBalance();
    const currentAccount = useCurrentAccount();
    const [isLoading, setIsLoading] = useState(false);
    const [jwt, setJwt] = useState<string | null>(null);
    const url = `${FAUCET_API}/api/faucet`;

    const allWallets = useWallets();
    const wallets = allWallets.filter(isEnokiWallet);
    const isEnokiConnected = currentAccount && allWallets.some(wallet =>
        isEnokiWallet(wallet) && wallet.accounts.some(account => account.address === currentAccount.address)
    );


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
        setIsLoading(true);

        try {
            if (isEnokiConnected && jwt) {
                // Use Enoki faucet for Enoki wallets
                const resp = await axios.get(url, {
                    headers: {
                        'Enoki-api-key': ENOKI_API_KEY,
                        Authorization: `Bearer ${jwt}`,
                    },
                });
                await client.waitForTransaction({ digest: resp.data.txDigest, timeout: 10_000 });
            } else if (currentAccount?.address && FULL_NODE.includes('testnet')) {
                // Use public Sui testnet faucet for regular wallets on testnet
                const resp = await axios.post('https://faucet.testnet.sui.io/v2/gas', {
                    FixedAmountRequest: {
                        recipient: currentAccount.address
                    }
                });

                if (resp.data.error) {
                    throw new Error(resp.data.error);
                }

                // Wait a bit for the transaction to be processed
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                throw new Error('Faucet not available for this wallet/network combination.');
            }

            reFetchData();
        } catch (err: any) {
            console.error('Faucet error:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Faucet limitation reached. Try again later.';
            return Promise.reject(new Error(errorMessage));
        } finally {
            setIsLoading(false);
        }
        return Promise.resolve();
    };

    return { requestSui, isLoading, isEnokiConnected };
};
