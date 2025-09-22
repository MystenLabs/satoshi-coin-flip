import { useEffect, useState } from 'react';
import { useOnChainHistory } from './useOnChainHistory';

const PAGE_SIZE = 5;
export const useRecentHistoryQuery = () => {
    const [pagesNum, setPagesNum] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const { data: allData, isLoading, isError } = useOnChainHistory();

    // Paginate the data
    const data = allData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    useEffect(() => {
        if (!Array.isArray(allData) || !allData?.length) setPagesNum(0);
        else setPagesNum(Math.ceil(allData.length / PAGE_SIZE));
    }, [allData]);

    const handleSelectPage = (page: number) => setCurrentPage(page);

    return {
        data,
        isLoading,
        isError,
        pagesNum,
        currentPage,
        handleSelectPage,
    };
};
