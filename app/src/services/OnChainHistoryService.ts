import { SuiClient } from '@mysten/sui/client';
import { GameHistory } from '../types/GameHistory';

export class OnChainHistoryService {
    private readonly client: SuiClient;
    private readonly packageId: string;

    constructor(client: SuiClient, packageId: string) {
        this.client = client;
        this.packageId = packageId;
    }

    async getPlayerGameHistory(playerAddress: string, limit: number = 50): Promise<GameHistory[]> {
        try {
            // Get NewGame events for this player
            const newGameEvents = await this.client.queryEvents({
                query: {
                    MoveEventType: `${this.packageId}::single_player_satoshi::NewGame`,
                },
                limit,
                order: 'descending',
            });

            // Get all Outcome events
            const outcomeEvents = await this.client.queryEvents({
                query: {
                    MoveEventType: `${this.packageId}::single_player_satoshi::Outcome`,
                },
                limit: limit * 2, // Get more outcome events since they include all players
                order: 'descending',
            });

            // Create a map of game outcomes by game_id
            const outcomeMap = new Map<string, { status: number; timestamp: string }>();
            for (const event of outcomeEvents.data) {
                const outcomeData = event.parsedJson as { game_id: string; status: number };
                if (outcomeData.game_id && !outcomeMap.has(outcomeData.game_id)) {
                    outcomeMap.set(outcomeData.game_id, {
                        status: outcomeData.status,
                        timestamp: new Date(parseInt(event.timestampMs!)).toISOString(),
                    });
                }
            }

            // Process NewGame events and match with outcomes
            const gameHistory: GameHistory[] = [];

            for (const event of newGameEvents.data) {
                const gameData = event.parsedJson as {
                    game_id: string;
                    player: string;
                    guess: string;
                    user_stake: string;
                    fee_bp: number;
                };

                // Only include games for this player
                if (gameData.player !== playerAddress) {
                    continue;
                }

                const outcome = outcomeMap.get(gameData.game_id);
                const userStake = parseInt(gameData.user_stake);

                let result: 'win' | 'loss' | 'pending' = 'pending';
                let balanceChange = 0;
                let dateEnded: string | null = null;

                if (outcome) {
                    dateEnded = outcome.timestamp;
                    if (outcome.status === 1) { // PLAYER_WON_STATE
                        result = 'win';
                        balanceChange = userStake; // Player gets back their stake + house stake
                    } else if (outcome.status === 2) { // HOUSE_WON_STATE
                        result = 'loss';
                        balanceChange = -userStake; // Player loses their stake
                    }
                }

                gameHistory.push({
                    id: gameData.game_id,
                    dateCreated: new Date(parseInt(event.timestampMs!)).toISOString(),
                    dateEnded,
                    coinSide: gameData.guess === 'H' ? 'head' : 'tails',
                    result,
                    balanceChange,
                    userStake,
                });
            }

            // Sort by date created (newest first)
            return gameHistory.sort((a, b) =>
                new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
            );

        } catch (error) {
            console.error('Error fetching on-chain game history:', error);
            throw error;
        }
    }
}