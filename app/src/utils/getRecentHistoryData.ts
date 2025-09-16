import { getGamesRequest } from '../api/satoshiApi';

export const getRecentHistoryData = async (
    currentPage: number,
    PAGE_SIZE: number,
    API_BASE_URL: string,
) => {
    const res = await getGamesRequest(API_BASE_URL);
    const sortedData = res.data.games.sort((a: any, b: any) => {
        return (
            new Date(b.details.date_created).getTime() - new Date(a.details.date_created).getTime()
        );
    });
    const paginatedData = sortedData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const result = paginatedData.map((game: any) => ({
        id: game.gameId,
        dateCreated: game.details.date_created,
        dateEnded: game.details.date_ended,
        coinSide: game.details.guess === 'H' ? 'head' : 'tails',
        result: game.details.player_won ? 'win' : 'loss',
        balanceChange: game.details.player_won ? 5000 : -5000,
    }));
    return result;
};
