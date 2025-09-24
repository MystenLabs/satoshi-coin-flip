import { z } from 'zod';

interface useConfigProps {
    log?: boolean;
}

export const useConfig = ({ log = false }: useConfigProps) => {
    const ConfigSchema = z.object({
        VITE_DEMO_CONFIG: z.string().default('demo'),
        VITE_SUI_NETWORK: z.string(),
        VITE_PACKAGE_ID: z.string(),
        VITE_HOUSE_DATA: z.string(),
        VITE_BACKEND_API: z.string(),
        VITE_FAUCET_API: z.string(),
        VITE_ENOKI_API_KEY: z.string(),
    });

    const config = ConfigSchema.parse(import.meta.env);

    if (log) {
        console.log({ config });
    }

    return {
        DEMO: config.VITE_DEMO_CONFIG,
        FULL_NODE: config.VITE_SUI_NETWORK,
        COIN_TYPE: '0x2::sui::SUI',
        GAME_BALANCE: '500000000',
        PACKAGE_ID: config.VITE_PACKAGE_ID,
        HOUSE_DATA: config.VITE_HOUSE_DATA,
        API_BASE_URL: config.VITE_BACKEND_API,
        FAUCET_API: config.VITE_FAUCET_API,
        ENOKI_API_KEY: config.VITE_ENOKI_API_KEY,
    };
};
