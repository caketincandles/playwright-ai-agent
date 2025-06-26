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

/**
 * Default logger configuration.
 * Sets the minimum log level and whether timestamps are shown.
 */
export const DEV_LOG_CONFIG: Types.ILoggerConfig = {
    minLevel: LOG_LEVEL.INFO,
    userFacing: false,
};

/**
 * User-facing logger configuration.
 * Optimised for end-user readability.
 */
export const INSTALLATION_LOG_CONFIG: Types.ILoggerConfig = {
    minLevel: LOG_LEVEL.INFO,
    userFacing: true,
};
