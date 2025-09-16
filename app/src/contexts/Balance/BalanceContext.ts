import { createContext } from 'react';
import { BalanceContextProps } from '../../types/BalanceContextProps';
import { TransactionObjectArgument, TransactionBlock } from '@mysten/sui.js/transactions';

export const BalanceContext = createContext<BalanceContextProps>({
    balance: 0,
    isLoading: false,
    isError: false,
    reFetchData: async () => {},
    getCoin: (amount: number) => '',
    getAllCoinsAsTxArgs: (tx: TransactionBlock) => [],
    address: undefined,
});
