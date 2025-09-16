export const getRandomId = () => {
    // get a random hex string with 32 characters
    return '0x' + Math.random().toString(16).slice(2);
};
