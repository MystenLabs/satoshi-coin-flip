import { truncateObjectId } from '../../helpers/truncateObjectId';
import { useGetTransactionsOfGame } from '../../hooks/useGetTransactionsOfGame';
import { AddIcon } from '../../icons/tsx/AddIcon';
import { FlagIcon } from '../../icons/tsx/FlagIcon';
import { LinkExternal } from '../../icons/tsx/LinkExternal';
import { PlayIcon } from '../../icons/tsx/PlayIcon';
import { GameTransactionType } from '../../types/GameHistory';
import { cloneElement } from 'react';
import { useConfig } from '../../hooks/useConfig';

interface GameTransactionsTableProps {
    gameId: string;
}

export const GameTransactionsTable = ({ gameId }: GameTransactionsTableProps) => {
    const { data } = useGetTransactionsOfGame(gameId);
    const { FULL_NODE: SUI_NETWORK } = useConfig({});

    const getSuiscanUrl = (txId: string) => {
        const network = SUI_NETWORK.includes('mainnet') ? 'mainnet' : 'testnet';
        return `https://suiscan.xyz/${network}/tx/${txId}`;
    };

    const renderTransactionType = (type: GameTransactionType) => {
        let text = 'End Game Tx';
        let icon = <FlagIcon />;
        switch (type) {
            case 'playGame':
                text = 'Play Game Tx';
                icon = <PlayIcon />;
                break;
            case 'newGame':
                text = 'New Game Tx';
                icon = <AddIcon />;
                break;
        }
        return (
            <div className="flex items-center justify-start space-x-2">
                {cloneElement(icon, { className: 'w-5' })}
                <div className="text-gray-400">{text}</div>
            </div>
        );
    };
    return (
        <table className="h-full w-full table-auto bg-gray-800">
            <tbody>
                {data.map(({ type, id }) => (
                    <tr key={id}>
                        <td className="py-5 pl-4">{renderTransactionType(type)}</td>
                        <td className="py-5 pr-4">
                            <div className="flex items-center justify-between space-x-2">
                                <div>{truncateObjectId(id)}</div>
                                <a
                                    href={getSuiscanUrl(id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:opacity-80"
                                >
                                    <button>
                                        <LinkExternal className="w-4" color="#FFD600" />
                                    </button>
                                </a>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
