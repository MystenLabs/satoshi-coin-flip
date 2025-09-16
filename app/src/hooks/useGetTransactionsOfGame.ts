import { getRandomId } from '../helpers/random';
import { GameTransaction } from '../types/GameHistory';
import { useMemo } from 'react';

export const useGetTransactionsOfGame = (gameId: string) => {
    const transactions = useMemo<GameTransaction[]>(
        () => [
            {
                type: 'endGame',
                id: getRandomId(),
            },
            {
                type: 'playGame',
                id: getRandomId(),
            },
            {
                type: 'newGame',
                id: getRandomId(),
            },
        ],
        [gameId],
    );

    return {
        data: transactions,
        isLoading: false,
        isError: false,
    };
};
