import chalk from 'chalk';
import process from 'process';
import * as CONSTS from '@lib/services/logger/developer/consts';
import * as Types from '@lib/services/logger/developer/types';

export { CONSTS, Types };

export class Log implements Types.IDeveloperLog {
    /**
     * Logs debug information (development only).
     * @param message - Debug message
     * @param details - Additional debug data
     */
    public debug(message: string, details?: unknown): void {
        this.log(CONSTS.LOG_LEVEL.DEBUG, message, details);
    }

    /**
     * Logs general information.
     * @param message - Information message
     * @param details - Additional context data
     */
    public info(message: string, details?: unknown): void {
        this.log(CONSTS.LOG_LEVEL.INFO, message, details);
    }

    /**
     * Logs successful operations.
     * @param message - Success message
     * @param details - Additional success data
     */
    public success(message: string, details?: unknown): void {
        this.log(CONSTS.LOG_LEVEL.SUCCESS, `✅ ${message}`, details);
    }

    /**
     * Logs warnings for non-fatal issues that should not stop execution.
     * @param message - Warning message
     * @param details - Warning details or context
     */
    public warn(message: string, details?: unknown): void {
        this.log(CONSTS.LOG_LEVEL.WARN, `⚠️ ${message}`, details);
    }

    /**
     * Logs fatal errors and exits the process.
     * Use this for unrecoverable errors that should stop execution.
     * @param message - Error message
     * @param error - Error object or details
     */
    public error(message: string, error?: unknown): void {
        this.log(CONSTS.LOG_LEVEL.ERROR, `❌ ${message}`, error);
    }

    /**
     * Unformatted Log
     * Use this for non-standard formatting outputs 
     * @param message - Error message
     * @param details - Details or context
     */
    public std(message: string, details?: unknown): void {
        process.stdout.write(`${message}${details ? chalk.italic(` - ${this.formatData(details)}`) : ''}`);
    }

    /**
     * Core logging method with level filtering and formatting.
     * @param level - Log level for the message
     * @param message - Message to log
     * @param details - Additional data to include
     */
    private log(level: Types.TLogLevelValue, message: string, details?: unknown): void {
        const output = `${chalk.dim(new Date().toISOString())} ${CONSTS.COLOUR_MAP[level](CONSTS.LOG_LEVEL_REVERSE[level])}: "${message}${details ? chalk.italic(` - ${this.formatData(details)}`) : ''}".\n`;

        (level >= CONSTS.LOG_LEVEL.ERROR ? process.stderr : process.stdout).write(output);
    }

    /**
     * Formats data for consistent display.
     * @param data - Data to format
     * @returns Formatted string representation
     */
    private formatData(data: unknown): string {
        if (data instanceof Error) return data.stack ?? data.message;
        if (typeof data === 'object' && data !== null) return JSON.stringify(data, null, 2);
        return typeof data === 'number' ? data.toString() : String(data);
    }
}