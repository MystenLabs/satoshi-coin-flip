import { useState } from 'react';
import { RecentHistoryHeader } from './RecentHistoryHeader';
import { RecentHistoryTable } from './RecentHistoryTable';
import { GameTransactionsTable } from './GameTransactionsTable';
import { PaginationSelector } from './PaginationSelector';
import { useRecentHistoryQuery } from '../../hooks/useRecentHistoryQuery';

interface RecentHistoryProps {
    showHeader?: boolean;
    fullWidth?: boolean;
    isPaginationEnabled?: boolean;
}

export const RecentHistory = ({
    showHeader = true,
    fullWidth = false,
    isPaginationEnabled = false,
}: RecentHistoryProps) => {
    const { data, isLoading, isError, pagesNum, currentPage, handleSelectPage } =
        useRecentHistoryQuery();
    const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

    const handleSelectGame = (game: string | null) => {
        setSelectedGameId(game);
    };

    return (
        <div className="grid w-full grid-cols-12">
            {!fullWidth && <div className="md:col-span-1 lg:col-span-2 xl:col-span-3" />}
            <div
                className={`col-span-12 flex-nowrap items-center justify-center space-y-4 text-white ${
                    fullWidth ? '' : 'sm:col-span-12 md:col-span-10 lg:col-span-8 xl:col-span-6'
                }`}
            >
                {!!showHeader && <RecentHistoryHeader />}
                {isLoading && <div className="text-center text-lg">Loading...</div>}
                {isError && (
                    <div className="text-center text-lg">
                        Sorry, we could not get your games history
                    </div>
                )}
                {Array.isArray(data) && !!data?.length && (
                    <div className="shadow-full grid w-full grid-cols-2 place-items-center gap-y-5">
                        <div className="col-span-2 h-full w-full sm:col-span-2 md:col-span-1">
                            <RecentHistoryTable
                                selectedGameId={selectedGameId}
                                handleSelectGame={handleSelectGame}
                                data={data}
                                isLoading={isLoading}
                                isError={isError}
                            />
                        </div>
                        {!!selectedGameId && (
                            <div className="col-span-2 h-full w-full sm:col-span-2 md:col-span-1">
                                <GameTransactionsTable gameId={selectedGameId} />
                            </div>
                        )}
                    </div>
                )}
                {(!Array.isArray(data) || !data?.length) && !isError && !isLoading && <div className="text-center text-lg">No games played yet</div>}
            </div>
            {!!isPaginationEnabled && (
                <div className="col-span-12">
                    <PaginationSelector
                        pagesNum={pagesNum}
                        currentPage={currentPage}
                        handleSelectPage={handleSelectPage}
                    />
                </div>
            )}
        </div>
    );
};
