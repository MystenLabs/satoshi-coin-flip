import { useEffect, useState } from 'react';
import { useGame } from '../../hooks/useGame';
import { GameResultDialog } from './GameResultDialog';
import { RecentHistoryDialog } from '../RecentHistory/RecentHistoryDialog';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { CoinImages } from './CoinImages';
import { GameActions } from './GameActions';
import { useGetBalance } from '../../hooks/useGetBalance';

export const CurrentGame = () => {
    const queryClient = useQueryClient();
    const currentAccount = useCurrentAccount();
    const { reFetchData: reFetchBalance } = useGetBalance();
    const [isShowingHead, setIsShowingHead] = useState<boolean>(true);
    const [isShowingAllResultsDialog, setIsShowingAllResultsDialog] = useState<boolean>(false);
    const {
        txnDigest,
        gameResult,
        choice,
        isLoading,
        createGameLoading,
        handlePlayGame,
        handleEndGame,
    } = useGame();

    const handleShowHead = () => setIsShowingHead(true);
    const handleShowTails = () => setIsShowingHead(false);

    const handleShowAllResultsDialog = () => {
        setIsShowingAllResultsDialog(true);
        handleEndGame();
    };

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ['onChainHistory', currentAccount?.address] });
        reFetchBalance();
    };

    useEffect(() => {
        if (gameResult) {
            refresh();
            const shouldShowHeadIcon =
                (gameResult === 'win' && choice === 'head') ||
                (gameResult === 'loss' && choice === 'tails');
            setIsShowingHead(shouldShowHeadIcon);
        }
    }, [gameResult]);

    return (
        <div className="grid w-full grid-cols-1 place-items-center gap-y-8">
            <div className="text-white">
                <p className="">
                    Stake <span className="font-bold">0.5 SUI</span> with a 50% chance to win{' '}
                    <span className="font-bold">1 SUI</span>!
                </p>
            </div>
            <CoinImages
                isLoading={isLoading}
                isShowingHead={isShowingHead}
                setIsShowingHead={setIsShowingHead}
            />
            <GameActions
                gameResult={gameResult}
                isLoading={isLoading}
                createGameLoading={createGameLoading}
                handlePlayGame={handlePlayGame}
                handleShowHead={handleShowHead}
                handleShowTails={handleShowTails}
            />
            <GameResultDialog
                isOpen={!isLoading && !!gameResult}
                result={gameResult}
                choice={choice}
                txnDigest={txnDigest}
                onShowAllResultsDialog={handleShowAllResultsDialog}
                onClose={handleEndGame}
            />
            <RecentHistoryDialog
                isOpen={isShowingAllResultsDialog}
                onClose={() => setIsShowingAllResultsDialog(false)}
            />
        </div>
    );
};
