import { useSuiClientContext } from '@mysten/dapp-kit';
import { useEffect } from 'react';
import { isEnokiNetwork, registerEnokiWallets } from '@mysten/enoki';
import { useConfig } from '../hooks/useConfig';

export function RegisterEnokiWallets() {
    const { client, network } = useSuiClientContext();
    const config = useConfig({});

    useEffect(() => {
        if (!isEnokiNetwork(network)) return;

        const { unregister } = registerEnokiWallets({
            apiKey: config.ENOKI_API_KEY,
            providers: {
                google: {
                    clientId: '50060024202-3m1ruh1frqt0skl6nsied0oaf2gnscd3.apps.googleusercontent.com',
                },
            },
            client,
            network,
        });

        return unregister;
    }, [client, network, config.ENOKI_API_KEY]);

    return null;
}