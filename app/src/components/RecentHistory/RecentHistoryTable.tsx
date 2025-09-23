import { useEffect } from 'react';
import { CoinSide, GameHistory } from '../../types/GameHistory';
import head_image from '../../icons/svg/head.svg';
import tails_image from '../../icons/svg/tails.svg';
import { displayLargeNumber } from '../../helpers/displayNumbers';
import { ChevronRight } from '../../icons/tsx/ChevronRight';

interface RecentHistoryTableProps {
    selectedGameId: string | null;
    handleSelectGame: (gameId: string | null) => void;
    data?: GameHistory[];
    isLoading: boolean;
    isError: boolean;
}

export const RecentHistoryTable = ({
    selectedGameId,
    handleSelectGame,
    data,
    isLoading,
    isError,
}: RecentHistoryTableProps) => {
    useEffect(() => {
        if (data && data.length > 0) {
            if (!selectedGameId) {
                handleSelectGame(data[0].id);
            }
        } else {
            handleSelectGame(null);
        }
    }, [data, selectedGameId]);

    const renderCoinSide = (coinSide: CoinSide) => {
        let text = 'Head';
        let src = head_image;
        if (coinSide === 'tails') {
            text = 'Tails';
            src = tails_image;
        }
        return (
            <div className="flex items-center justify-start space-x-4">
                <img src={src as any} alt={text} className="h-8" />
                <div className="font-bold text-white">{text}</div>
            </div>
        );
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error</div>;

    return (
        <table className="h-full w-full table-auto bg-gray-900">
            <tbody className="w-full">
                {data?.map(({ id, coinSide, result, balanceChange }) => (
                    <tr
                        key={id}
                        className={`hover:cursor-pointer ${
                            selectedGameId === id ? 'bg-gray-800' : ''
                        }`}
                        onClick={() => handleSelectGame(id)}
                    >
                        <td className="py-5 pl-4">{renderCoinSide(coinSide)}</td>
                        <td>
                            <div className="text-gray-400">
                                {result.slice(0, 1).toUpperCase() + result.slice(1)}
                            </div>
                        </td>
                        <td>
                            <div
                                className={`text-end ${
                                    balanceChange > 0 ? 'text-green-500' : 'text-red-600'
                                }`}
                            >
                                {displayLargeNumber(balanceChange)} SUI
                            </div>
                        </td>
                        <td className="pl-4">
                            <ChevronRight />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
