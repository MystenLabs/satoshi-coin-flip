export type CoinSide = 'head' | 'tails';
export type GameResult = 'win' | 'loss' | 'pending';
export interface GameHistory {
    id: string;
    coinSide: CoinSide;
    result: GameResult;
    balanceChange: number;
    dateCreated: string;
    dateEnded: string | null;
    userStake: number;
}

export type GameTransactionType = 'newGame' | 'playGame' | 'endGame';
export interface GameTransaction {
    type: GameTransactionType;
    id: string;
}
