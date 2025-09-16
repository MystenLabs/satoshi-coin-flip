import { useRecentHistoryQuery } from '../../hooks/useRecentHistoryQuery';

interface PaginationSelectorProps {
    pagesNum: number;
    currentPage: number;
    handleSelectPage: (page: number) => void;
}

export const PaginationSelector = ({
    pagesNum,
    currentPage,
    handleSelectPage,
}: PaginationSelectorProps) => {
    const pages = Array.from(Array(pagesNum).keys()).map((page) => page + 1);
    return (
        <div className="spac-y-2 flex space-x-2 pl-2 pt-4 text-black">
            {pages.map((page) => (
                <button
                    key={page}
                    className={`${
                        page === currentPage ? 'bg-primary' : 'text-white'
                    } rounded-md px-4 py-2`}
                    onClick={() => handleSelectPage(page)}
                >
                    {page}
                </button>
            ))}
        </div>
    );
};
