import chalk from 'chalk';
import * as BASE_CONSTS from '@src/services/consts';
import * as BaseTypes from '@src/services/types';

export const COLOUR_MAP: Record<
    BaseTypes.TServiceType,
    (text: string) => string
> = {
    [BASE_CONSTS.SERVICE.HEAL]: chalk.bgGreen.black,
    [BASE_CONSTS.SERVICE.CREATE]: chalk.bgBlue.white,
    [BASE_CONSTS.SERVICE.IMPROVE]: chalk.bgYellow.black,
} as const;
