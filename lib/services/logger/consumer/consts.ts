import chalk from 'chalk';
import * as Config from '@src/config';

export const COLOUR_MAP: Record<
    Config.Types.TServiceType,
    (text: string) => string
> = {
    [Config.CONSTS.SERVICE.HEAL]: chalk.bgGreen.black,
    [Config.CONSTS.SERVICE.CREATE]: chalk.bgBlue.white,
    [Config.CONSTS.SERVICE.IMPROVE]: chalk.bgYellow.black,
} as const;
