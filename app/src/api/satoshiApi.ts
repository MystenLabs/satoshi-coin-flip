import axios from 'axios';

export const registerGameRequest = (baseUrl: string, gameId: string, txnDigest: string) => {
    const requestUrl = `${baseUrl}/api/game/register`;
    const body = { gameId, txnDigest };
    return axios.post(requestUrl, body);
};

export const playGameRequest = (baseUrl: string, gameId: string, txnDigest: string) => {
    const requestUrl = `${baseUrl}/api/game/play`;
    const body = { gameId, txnDigest };
    return axios.post(requestUrl, body);
};

// No longer needed with on-chain randomness
// export const blsSignGameRequest = (baseUrl: string, gameId: string, userRandomness: string) => {
//     const gameId_ = gameId.replace('0x', '').concat(userRandomness);
//     const requestUrl = `${baseUrl}/game/sign`;
//     const body = { gameId: gameId_ };
//     return axios.post(requestUrl, body);
// };

// export const endGameRequest = (baseUrl: string, gameId: string, blsSig: any) => {
//     const requestUrl = `${baseUrl}/game/single/end`;
//     const body = { gameId, blsSig };
//     return axios.post(requestUrl, body);
// };

export const getGamesRequest = (baseUrl: string) => {
    const requestUrl = `${baseUrl}/api/game/details`;
    return axios.get(requestUrl);
};
