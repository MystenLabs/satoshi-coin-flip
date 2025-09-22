import { TransactionObjectArgument, Transaction } from '@mysten/sui/transactions';

export interface BalanceContextProps {
    balance: number;
    isLoading: boolean;
    isError: boolean;
    reFetchData: () => void;
    getCoin: (amount: number) => string | undefined;
    getAllCoinsAsTxArgs: (tx: Transaction) => TransactionObjectArgument[];
    address: string | undefined;
}
