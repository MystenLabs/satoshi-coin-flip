import { Button } from '../General/Button';
import { CoinSide, GameResult } from '../../types/GameHistory';
import { useCurrentAccount } from '@mysten/dapp-kit';

interface GameActionsProps {
    gameResult: GameResult | null;
    isLoading: boolean;
    createGameLoading: boolean;
    handlePlayGame: (choice: CoinSide) => void;
    handleShowHead: () => void;
    handleShowTails: () => void;
}

export const GameActions = ({
    gameResult,
    isLoading,
    createGameLoading,
    handlePlayGame,
    handleShowHead,
    handleShowTails,
}: GameActionsProps) => {
    const currentAccount = useCurrentAccount();

    if (!isLoading && !gameResult)
        return (
            <>
                <div className="flex justify-center space-x-4">
                    <Button
                        variant="contained"
                        onMouseOver={handleShowHead}
                        onClick={() => handlePlayGame('head')}
                        disabled={!currentAccount?.address}
                    >
                        Pick Head
                    </Button>
                    <Button
                        variant="contained"
                        onMouseOver={handleShowTails}
                        onClick={() => handlePlayGame('tails')}
                        disabled={!currentAccount?.address}
                    >
                        Pick Tails
                    </Button>
                </div>
                {!currentAccount?.address && (
                    <div className="text-gray-200">
                        Please connect your wallet to start the game
                    </div>
                )}
            </>
        );
    if (isLoading) {
        return (
            <div className="text-gray-200">
                <div className="text-center text-2xl">Flipping the coin...</div>
                <div className="text-md text-gray-400">
                    {createGameLoading && (
                        <p>
                            <span className=" text-gray-500">👤 [1/2] - </span> Submitting a new
                            game transaction
                        </p>
                    )}
                    {!createGameLoading && (
                        <p>
                            <span className="text-gray-500">🏠 [2/2] - </span> House is ending the
                            game
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return null;
};
