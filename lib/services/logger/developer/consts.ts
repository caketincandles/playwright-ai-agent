import chalk from 'chalk';
import * as Types from '@lib/services/logger/developer/types';

/**
 * Log level mapping.
 * Defines the numeric severity levels for various logging types.
 */
export const LOG_LEVEL = {
    DEBUG: 0,
    INFO: 1,
    SUCCESS: 2,
    WARN: 3,
    ERROR: 4,
} as const;


/**
 * Reverse mapping from log level values to their string keys.
 * Useful for converting numeric levels back to their readable identifiers.
 */
export const LOG_LEVEL_REVERSE: Record<
    Types.TLogLevelValue,
    Types.TLogLevelKey
> = {
    [LOG_LEVEL.DEBUG]: 'DEBUG',
    [LOG_LEVEL.INFO]: 'INFO',
    [LOG_LEVEL.SUCCESS]: 'SUCCESS',
    [LOG_LEVEL.WARN]: 'WARN',
    [LOG_LEVEL.ERROR]: 'ERROR',
} as const;

export const COLOUR_MAP: Record<
    Types.TLogLevelValue,
    (text: string) => string
> = {
    [LOG_LEVEL.DEBUG]: chalk.white,
    [LOG_LEVEL.ERROR]: chalk.redBright,
    [LOG_LEVEL.INFO]: chalk.blueBright,
    [LOG_LEVEL.WARN]: chalk.yellowBright,
    [LOG_LEVEL.SUCCESS]: chalk.greenBright,
} as const;
