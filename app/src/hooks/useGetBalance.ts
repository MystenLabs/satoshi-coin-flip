import { useContext } from 'react';
import { BalanceContext } from '../contexts/Balance/BalanceContext';

export const useGetBalance = () => {
    const context = useContext(BalanceContext);
    return context;
};
