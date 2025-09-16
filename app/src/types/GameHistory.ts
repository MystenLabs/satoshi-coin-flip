export type CoinSide = 'head' | 'tails';
export type GameResult = 'win' | 'loss';
export interface GameHistory {
    id: string;
    coinSide: CoinSide;
    result: GameResult;
    balanceChange: number;
    dateCreated: string;
    dateEnded: string;
}

export type GameTransactionType = 'newGame' | 'playGame' | 'endGame';
export interface GameTransaction {
    type: GameTransactionType;
    id: string;
}
