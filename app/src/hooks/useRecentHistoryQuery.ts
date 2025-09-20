import { useEffect, useState } from 'react';
import { useConfig } from './useConfig';
import { useQuery } from '@tanstack/react-query';
import { ReactQueryKeys } from '../constants/reactQueryKeys';
import { getRecentHistoryData } from '../utils/getRecentHistoryData';

const PAGE_SIZE = 5;
export const useRecentHistoryQuery = () => {
    const { API_BASE_URL } = useConfig({});
    const [pagesNum, setPagesNum] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const { data, isLoading, isError } = useQuery({
        queryKey: [ReactQueryKeys.RECENT_HISTORY_GET, currentPage],
        queryFn: () => getRecentHistoryData(currentPage, PAGE_SIZE, API_BASE_URL),
        enabled: !!currentPage,
        gcTime: 0,
    });

    // console.log({ data });

    useEffect(() => {
        if (!Array.isArray(data) || !data?.length) setPagesNum(0);
        else setPagesNum(Math.ceil(data.length / PAGE_SIZE) + 1);
    }, [data]);

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
