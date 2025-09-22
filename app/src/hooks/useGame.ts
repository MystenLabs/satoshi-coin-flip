import { CoinSide, GameResult } from '../types/GameHistory';
import { useState } from 'react';
import { useSui } from './useSui';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useConfig } from './useConfig';
import { toast } from 'react-hot-toast';
import { Transaction, coinWithBalance } from '@mysten/sui/transactions';
import { useGetBalance } from './useGetBalance';
import { useOnChainHistory } from './useOnChainHistory';
import { MIST_PER_SUI } from '@mysten/sui/utils';
import { startGame, finishGame } from '../__generated__/satoshi_flip/single_player_satoshi';

export const useGame = () => {
    const { enokiSponsorExecute, client } = useSui();
    const { balance, reFetchData } = useGetBalance();
    const { refetch: refetchHistory } = useOnChainHistory();
    const currentAccount = useCurrentAccount();
    const { GAME_BALANCE, PACKAGE_ID, HOUSE_DATA } = useConfig({});
    const [isLoading, setIsLoading] = useState(false);
    const [createGameLoading, setCreateGameLoading] = useState(false);
    const [gameResult, setGameResult] = useState<GameResult | null>(null);
    const [choice, setChoice] = useState<CoinSide | null>(null);
    const [currentGameId, setCurrentGameId] = useState<string | null>(null);
    const [txnDigest, setTxnDigest] = useState<string | null>(null);

    const handlePlayGame = async (choice: CoinSide) => {
        console.log('handlePlayGame - setting isLoading to true');
        setChoice(choice);
        setIsLoading(true);
        setCreateGameLoading(true);
        await handleNewGame(choice)
            .then(() => {
                // Don't set isLoading to false here - keep spinning until finish game completes
            })
            .catch((err) => {
                console.log(err);
                setIsLoading(false);
                let defaultMessage = 'Something went wrong, game could not be started.';
                if (err.message === 'Low Balance') {
                    defaultMessage = err.message;
                }
                if (err.message === 'No coins found') {
                    defaultMessage =
                        'No coins found. If this is your first time here, please click the "Request SUI" button to get some coins!';
                }
                toast.error(defaultMessage);
            });
    };

    const handleNewGame = async (choice: CoinSide) => {
        const tx = new Transaction();

        if (balance < +GAME_BALANCE / Number(MIST_PER_SUI)) {
            throw new Error('Low Balance');
        }

        // Use coinWithBalance utility to handle coin merging/splitting automatically
        const coin = coinWithBalance({
            balance: Number(GAME_BALANCE),
            useGasCoin: false // Important for Enoki sponsorship
        })(tx);
        startGame({
            package: PACKAGE_ID,
            arguments: {
                guess: choice === 'head' ? 'H' : 'T',
                coin,
                houseData: tx.object(HOUSE_DATA),
            },
        })(tx);
        const executionRes = await enokiSponsorExecute({ transactionBlock: tx });
        return client
            .getTransactionBlock({
                digest: executionRes.digest,
                options: {
                    showEffects: true,
                    showEvents: true,
                },
            })
            .then((resp) => {
                if (resp.effects?.status.status === 'success') {
                    const events = resp.events;
                    const createdGame = events?.find((o) => o.type.includes('::NewGame'))
                        ?.parsedJson as {
                        fee_bp: number;
                        game_id: string;
                        guess: string;
                        player: string;
                        user_stake: string;
                    };
                    const gameObjectId = createdGame.game_id;
                    if (gameObjectId) {
                        setCurrentGameId(gameObjectId);
                        reFetchData();
                        setCreateGameLoading(false);
                        return playGame(gameObjectId);
                    }
                    setCurrentGameId(null);
                } else {
                    setCurrentGameId(null);
                    console.log('game creation failed');
                    toast.error('Sorry, game could not be played.');
                }
            })
            .catch((err) => {
                setCurrentGameId(null);
                console.log('game creation failed');
                console.log(err);
                toast.error('Something went wrong, game could not be started.');
            })
            .finally(() => {
                setCreateGameLoading(false);
            });
    };

    const playGame = async (gameObjectId: string) => {
        console.log('finishing game with user transaction...');
        if (!currentAccount?.address) {
            throw new Error('No wallet connected');
        }

        const tx = new Transaction();
        finishGame({
            package: PACKAGE_ID,
            arguments: {
                gameId: tx.object(gameObjectId),
                houseData: tx.object(HOUSE_DATA),
            },
        })(tx);

        try {
            const executionRes = await enokiSponsorExecute({ transactionBlock: tx });
            const result = await client.getTransactionBlock({
                digest: executionRes.digest,
                options: {
                    showEffects: true,
                    showEvents: true,
                },
            });

            if (result.effects?.status.status === 'success') {
                const events = result.events;
                const outcomeEvent = events?.find((event) =>
                    event.type.includes('::Outcome')
                )?.parsedJson as { game_id: string; status: number };

                console.log('outcome event', outcomeEvent);
                const playerWon = outcomeEvent?.status === 1;
                setGameResult(playerWon ? 'win' : 'loss');
                setTxnDigest(result.digest);
                reFetchData(); // Refresh balance after game completion
                refetchHistory(); // Refresh game history
                console.log('Game completed - setting isLoading to false');
                setIsLoading(false); // Stop spinning after game completes
            } else {
                console.log('finish game transaction failed');
                toast.error('Game could not be finished.');
                setIsLoading(false); // Stop spinning on error
            }
        } catch (err) {
            console.log('Error finishing game:', err);
            toast.error('Something went wrong, game could not be finished.');
            setIsLoading(false); // Stop spinning on error
        }
    };

    const handleEndGame = () => {
        setIsLoading(false);
        setChoice(null);
        setGameResult(null);
    };

    return {
        currentGameId,
        txnDigest,
        gameResult,
        choice,
        isLoading,
        handlePlayGame,
        handleEndGame,
        createGameLoading,
    };
};
