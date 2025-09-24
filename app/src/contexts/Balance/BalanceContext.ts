import { createContext } from 'react';
import { BalanceContextProps } from '../../types/BalanceContextProps';
import { Transaction } from '@mysten/sui/transactions';

export const BalanceContext = createContext<BalanceContextProps>({
    balance: 0,
    isLoading: false,
    isError: false,
    reFetchData: async () => {},
    getCoin: (amount: number) => '',
    getAllCoinsAsTxArgs: (tx: Transaction) => [],
    address: undefined,
});
