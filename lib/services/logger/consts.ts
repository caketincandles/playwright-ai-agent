import chalk from 'chalk';
import * as Types from './types';

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

export const SERVICE = {
    HEAL: 'AI-Heal',
    CREATE: 'AI-Create',
    IMPROVE: 'AI-Improve',
    DEV: 'Developer-Log',
} as const;

export const TARGET = {
    LOCATOR: 'Locators',
    PAGE: 'Pages',
    API: 'API',
} as const;

/**
 * Default logger configuration.
 * Sets the minimum log level and whether timestamps are shown.
 */
export const DEFAULT_LOG_CONFIG: Types.ILoggerConfig = {
    minLevel: LOG_LEVEL.INFO,
    showTimestamp: false,
    userFacing: false,
};

/**
 * User-facing logger configuration.
 * Optimized for end-user readability.
 */
export const USER_LOG_CONFIG: Types.ILoggerConfig = {
    minLevel: LOG_LEVEL.INFO,
    showTimestamp: true,
    userFacing: true,
};

/**
 * Developer logger configuration.
 * Includes debug information and detailed output.
 */
export const DEV_LOG_CONFIG: Types.ILoggerConfig = {
    minLevel: LOG_LEVEL.DEBUG,
    showTimestamp: true,
    userFacing: false,
};

/**
 * Colour mapping for log levels.
 * Assigns a distinct colour to each log level for better readability in the terminal.
 */
export const LOG_COLOUR: Record<
    Types.TLogLevelValue,
    (text: string) => string
> = {
    [LOG_LEVEL.DEBUG]: chalk.gray,
    [LOG_LEVEL.INFO]: chalk.blue,
    [LOG_LEVEL.SUCCESS]: chalk.green,
    [LOG_LEVEL.WARN]: chalk.yellow,
    [LOG_LEVEL.ERROR]: chalk.red,
};

/**
 * Colour mapping for service types.
 * Assigns a background colour to each service for visual distinction.
 */
export const SERVICE_COLOUR: Record<string, (text: string) => string> = {
    [SERVICE.HEAL]: chalk.bgCyan,
    [SERVICE.CREATE]: chalk.bgMagenta,
    [SERVICE.IMPROVE]: chalk.bgYellow,
    [SERVICE.DEV]: chalk.bgRed,
} as const;

/**
 * Colour mapping for target types.
 * Assigns a text colour to each target for secondary distinction.
 */
export const TARGET_COLOUR: Record<string, (text: string) => string> = {
    [TARGET.LOCATOR]: chalk.cyan,
    [TARGET.PAGE]: chalk.magenta,
    [TARGET.API]: chalk.green,
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
