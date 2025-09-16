import BigNumber from 'bignumber.js';
import { TransactionObjectArgument, TransactionBlock } from '@mysten/sui.js/transactions';

export interface BalanceContextProps {
    balance: number;
    isLoading: boolean;
    isError: boolean;
    reFetchData: () => void;
    getCoin: (amount: number) => string | undefined;
    getAllCoinsAsTxArgs: (tx: TransactionBlock) => TransactionObjectArgument[];
    address: string | undefined;
}
