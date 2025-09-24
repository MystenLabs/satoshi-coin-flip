import { useQuery } from '@tanstack/react-query';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { OnChainHistoryService } from '../services/OnChainHistoryService';
import { useConfig } from './useConfig';

export const useOnChainHistory = () => {
    const currentAccount = useCurrentAccount();
    const client = useSuiClient();
    const { PACKAGE_ID } = useConfig({});

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['onChainHistory', currentAccount?.address],
        queryFn: async () => {
            if (!currentAccount?.address) {
                return [];
            }

            const historyService = new OnChainHistoryService(client, PACKAGE_ID);
            return historyService.getPlayerGameHistory(currentAccount.address);
        },
        enabled: !!currentAccount?.address,
        staleTime: 30000, // 30 seconds
        refetchInterval: 60000, // Refetch every minute
    });

    return {
        data: data || [],
        isLoading,
        isError,
        refetch,
    };
};