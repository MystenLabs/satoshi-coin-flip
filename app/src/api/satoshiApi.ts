import axios from 'axios';

export const registerGameRequest = (baseUrl: string, gameId: string, txnDigest: string) => {
    const requestUrl = `${baseUrl}/api/game/register`;
    const body = { gameId, txnDigest };
    return axios.post(requestUrl, body);
};

export const getGamesRequest = (baseUrl: string) => {
    const requestUrl = `${baseUrl}/api/game/details`;
    return axios.get(requestUrl);
};
