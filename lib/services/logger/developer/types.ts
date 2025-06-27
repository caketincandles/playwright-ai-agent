import * as CONSTS from '@lib/services/logger/developer/consts';

export type TLogLevelKey = keyof typeof CONSTS.LOG_LEVEL;
export type TLogLevelValue = (typeof CONSTS.LOG_LEVEL)[TLogLevelKey];

export interface IDeveloperLog {
    /**
     * Logs debug information (development only).
     * @param message - Debug message
     * @param details - Additional debug data
     */
    debug(message: string, details?: unknown): void;

    /**
     * Logs general information.
     * @param message - Information message
     * @param details - Additional context data
     */
    info(message: string, details?: unknown): void;

    /**
     * Logs successful operations.
     * @param message - Success message
     * @param details - Additional success data
     */
    success(message: string, details?: unknown): void;

    /**
     * Logs warnings for non-fatal issues that should not stop execution.
     * @param message - Warning message
     * @param details - Warning details or context
     */
    warn(message: string, details?: unknown): void;

    /**
     * Logs errors for fatal issues.
     * @remarks Ensure execution is stopped where appropriate
     * @param message - Error message
     * @param error - Error object or details
     */
    error(message: string, error?: unknown): void;

    /**
     * Unformatted Log 
     * @remarks Use this for non-standard formatting outputs 
     * @param message - Error message
     * @param details - Details or context
     */
    std(message: string, details?: unknown): void;
}
