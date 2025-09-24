import { GameTransaction } from '../types/GameHistory';
import { useOnChainHistory } from './useOnChainHistory';
import { useMemo } from 'react';

export const useGetTransactionsOfGame = (gameId: string) => {
    const { data: allGames, isLoading, isError } = useOnChainHistory();

    const transactions = useMemo<GameTransaction[]>(() => {
        if (!gameId || !allGames) return [];

        const game = allGames.find(g => g.id === gameId);
        if (!game) return [];

        const gameTransactions: GameTransaction[] = [];

        gameTransactions.push({
            type: 'newGame',
            id: game.newGameTxDigest,
        });

        if (game.playGameTxDigest) {
            gameTransactions.push({
                type: 'playGame',
                id: game.playGameTxDigest,
            });
        }

        return gameTransactions;
    }, [gameId, allGames]);

    return {
        data: transactions,
        isLoading,
        isError,
    };
};
