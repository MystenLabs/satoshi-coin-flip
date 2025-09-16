import { CoinSide, GameResult } from '../types/GameHistory';
import { useState } from 'react';
import { useSui } from './useSui';
// import { useWalletKit } from '@mysten/wallet-kit';
import { useConfig } from './useConfig';
import { toast } from 'react-hot-toast';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';
import { playGameRequest } from '../api/satoshiApi';
import { useGetBalance } from './useGetBalance';
import { MIST_PER_SUI } from '@mysten/sui/utils';

export const useGame = (counterNFT: any) => {
    const { enokiSponsorExecute, client } = useSui();
    const { balance, getAllCoinsAsTxArgs, reFetchData } = useGetBalance();
    // const { signTransactionBlock } = useWalletKit();
    const { GAME_BALANCE, PACKAGE_ID, HOUSE_DATA, API_BASE_URL } = useConfig({});
    const [isLoading, setIsLoading] = useState(false);
    const [createGameLoading, setCreateGameLoading] = useState(false);
    const [gameResult, setGameResult] = useState<GameResult | null>(null);
    const [choice, setChoice] = useState<CoinSide | null>(null);
    const [currentGameId, setCurrentGameId] = useState<string | null>(null);
    const [txnDigest, setTxnDigest] = useState<string | null>(null);

    const handlePlayGame = async (choice: CoinSide) => {
        setChoice(choice);
        setIsLoading(true);
        setCreateGameLoading(true);
        await handleNewGame(choice)
            .then(() => {
                setIsLoading(false);
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
        // let coinId = getCoin(Number(GAME_BALANCE));
        // if (!coinId) throw new Error('No coin found');
        // let coin = tx.splitCoins(tx.gas, [tx.pure(Number(GAME_BALANCE))]);

        if (balance < +GAME_BALANCE / Number(MIST_PER_SUI)) {
            throw new Error('Low Balance');
        }

        // We first merge all coins and then split the amount we need
        const allCoinArgs = getAllCoinsAsTxArgs(tx);
        if (!allCoinArgs || allCoinArgs?.length === 0) throw new Error('No coins found');
        const mergeInto = allCoinArgs.pop()!;
        if (allCoinArgs.length > 0) {
            tx.mergeCoins(mergeInto, allCoinArgs);
        }
        let coin = tx.splitCoins(mergeInto, [tx.pure.u64(Number(GAME_BALANCE))]);
        tx.moveCall({
            target: `${PACKAGE_ID}::single_player_satoshi::start_game`,
            arguments: [
                tx.pure(bcs.string().serialize(choice === 'head' ? 'H' : 'T')),
                coin,
                tx.object(HOUSE_DATA),
            ],
        });
        // const signedTx = await signTransactionBlock({
        //     transactionBlock: tx,
        // });
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
                // console.log(resp);
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
                    const txnDigest = resp.digest;
                    if (!!gameObjectId) {
                        setCurrentGameId(gameObjectId);
                        reFetchData();
                        setCreateGameLoading(false);
                        // setTxnDigest(txnDigest);
                        return playGame(gameObjectId, txnDigest);
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

        // Simple Enoki execution without sponsoring gas
        // console.log('creating game...');
        // return enokiExecute({
        //     transactionBlock: tx,
        //     requestType: 'WaitForLocalExecution',
        //     options: {
        //         showEffects: true,
        //         showEvents: true,
        //     },
        // })
        //     .then((resp) => {
        //         console.log(resp);
        //         if (resp.effects?.status.status === 'success') {
        //             const createdObjects = resp.effects?.created;
        //             const createdGame = createdObjects?.[0];
        //             const gameObjectId = createdGame?.reference.objectId;
        //             const txnDigest = resp.digest;
        //             if (!!gameObjectId) {
        //                 setCurrentGameId(gameObjectId);
        //                 return playGame(gameObjectId, userRandomnessHexString, txnDigest);
        //             }
        //             setCurrentGameId(null);
        //         } else {
        //             setCurrentGameId(null);
        //             console.log('game creation failed');
        //             toast.error('Sorry, game could not be played.');
        //         }
        //     })
        //     .catch((err) => {
        //         setCurrentGameId(null);
        //         console.log('game creation failed');
        //         console.log(err);
        //         toast.error('Something went wrong, game could not be started.');
        //     });
    };

    const playGame = async (gameObjectId: string, txnDigest: string) => {
        // console.log('playing game...');
        return playGameRequest(API_BASE_URL, gameObjectId, txnDigest)
            .then((resp) => {
                // console.log(resp);
                const { playerWon, transactionDigest } = resp.data;
                // console.log({ data: resp.data });
                setGameResult(playerWon ? 'win' : 'loss');
                setTxnDigest(transactionDigest);
            })
            .catch((err) => {
                console.log(err);
                toast.error('Something went wrong, game could not be played.');
            });
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
