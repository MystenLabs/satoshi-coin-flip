import { useState } from 'react';
import { Button } from '../General/Button';
import { RecentHistoryDialog } from './RecentHistoryDialog';

export const RecentHistoryHeader = () => {
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

    const handleShowHistoryDialog = () => setIsHistoryDialogOpen(true);
    const handleCloseHistoryDialog = () => setIsHistoryDialogOpen(false);

    return (
        <>
            <div className="flex w-full items-center justify-between px-4">
                <div className="text-start text-xl font-bold">Recent History</div>
                <Button variant="text" className="pr-0" onClick={handleShowHistoryDialog}>
                    View All
                </Button>
            </div>
            <RecentHistoryDialog isOpen={isHistoryDialogOpen} onClose={handleCloseHistoryDialog} />
        </>
    );
};
