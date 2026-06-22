import chalk from "chalk";

export const customRed = chalk.rgb(248, 113, 113);
export const customGreen = chalk.rgb(74, 222, 128);
export const customGrey = chalk.rgb(148, 163, 184);
export const customWhite = chalk.rgb(241, 245, 249);
export const customYellow = chalk.rgb(250, 204, 21);

const originalError = console.error;
console.error = function (...args) {
    const message = args.map(arg => String(arg)).join(' ');
    originalError.call(console, customRed(message));
};
