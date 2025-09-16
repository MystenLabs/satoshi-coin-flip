export const displayLargeNumber = (num: number) => {
    // display 50000 as +50,000
    // display -50000 as -50,000
    return `${num > 0 ? '+' : '-'} ${Math.abs(num).toLocaleString()}`;
};
