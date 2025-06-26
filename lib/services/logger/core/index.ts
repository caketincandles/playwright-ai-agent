import process from 'process';
import * as CONSTS from '@lib/services/logger/consts';
import * as Types from 'lib/services/logger/types';
import FileService, { Types as FileTypes } from '@lib/services/file';

/**
 * Enhanced logging system for AI automation operations.
 * Provides structured output, file logging, and process management for errors vs warnings.
 */
export class LoggerService implements Types.IBaseLogger {
    protected config: Types.ILoggerConfig;

    constructor(
        protected readonly tag: Types.ILogTag,
        config?: Partial<Types.ILoggerConfig>,
        protected readonly fileService: FileTypes.IFileService = new FileService(),
    ) {
        this.config = { ...CONSTS.DEFAULT_LOG_CONFIG, ...config };
    }

    /**
     * Logs debug information (development only).
     * @param message - Debug message
     * @param details - Additional debug data
     */
    debug(message: string, details?: unknown): void {
        this.log(CONSTS.LOG_LEVEL.DEBUG, message, details);
    }

    /**
     * Logs general information.
     * @param message - Information message
     * @param details - Additional context data
     */
    info(message: string, details?: unknown): void {
        const suffix = this.config.userFacing ? '' : '...';
        this.log(CONSTS.LOG_LEVEL.INFO, message + suffix, details);
    }

    /**
     * Logs successful operations.
     * @param message - Success message
     * @param details - Additional success data
     */
    success(message: string, details?: unknown): void {
        const prefix = '✅ ';
        const suffix = this.config.userFacing ? '' : '!';
        this.log(CONSTS.LOG_LEVEL.SUCCESS, prefix + message + suffix, details);
    }

    /**
     * Logs warnings for non-fatal issues that should not stop execution.
     * @param message - Warning message
     * @param details - Warning details or context
     */
    warn(message: string, details?: unknown): void {
        const suffix = this.config.userFacing ? '' : '.';
        this.log(CONSTS.LOG_LEVEL.WARN, '⚠️ ' + message + suffix);
        this.printDetails(details, CONSTS.LOG_COLOUR[CONSTS.LOG_LEVEL.WARN]);
    }

    /**
     * Logs fatal errors and exits the process.
     * Use this for unrecoverable errors that should stop execution.
     * @param message - Error message
     * @param error - Error object or details
     * @param exitCode - Process exit code (default: 1)
     */
    error(message: string, error?: unknown, exitCode = 1): never {
        const suffix = this.config.userFacing ? '' : '.';
        this.log(CONSTS.LOG_LEVEL.ERROR, '❌ ' + message + suffix);
        this.printDetails(error, CONSTS.LOG_COLOUR[CONSTS.LOG_LEVEL.ERROR]);

        // Always exit on errors to ensure failures are caught
        process.exit(exitCode);
    }

    /**
     * Creates a child logger with additional tag context.
     * @param additionalTag - Additional tag information
     * @returns New logger instance with combined tags
     */
    protected child(additionalTag: Partial<Types.ILogTag>): LoggerService {
        const combinedTag = { ...this.tag, ...additionalTag };
        return new LoggerService(combinedTag, this.config);
    }

    /**
     * Core logging method with level filtering and formatting.
     * @param level - Log level for the message
     * @param message - Message to log
     * @param details - Additional data to include
     */
    protected log(
        level: Types.TLogLevelValue,
        message: string,
        details?: unknown,
    ): void {
        if (level < this.config.minLevel) return;

        const timestamp = this.config.showTimestamp
            ? `[${new Date().toISOString()}] `
            : '';
        const levelLabel = CONSTS.LOG_COLOUR[level](
            CONSTS.LOG_LEVEL_REVERSE[level],
        );
        const serviceTag = CONSTS.SERVICE_COLOUR[this.tag.service](
            `[${this.tag.service}]`,
        );
        const targetTag = this.tag.target
            ? ` ${CONSTS.TARGET_COLOUR[this.tag.target](`[_${this.tag.target}_]`)}`
            : '';

        const output = `${timestamp}${levelLabel} ${serviceTag}${targetTag}: ${message}\n`;

        if (level >= CONSTS.LOG_LEVEL.ERROR) {
            process.stderr.write(output);
        } else process.stdout.write(output);

        if (details !== undefined) {
            this.printDetails(details, CONSTS.LOG_COLOUR[level]);
        }
    }

    /**
     * Prints detailed information with consistent formatting.
     * @param data - Data to print
     * @param colorFn - Color function for styling
     */
    protected printDetails(
        data: unknown,
        colorFn: (text: string) => string,
    ): void {
        if (data === undefined || data === null) return;

        const formatted = this.formatData(data);
        const output = colorFn(formatted) + '\n';

        process.stderr.write(output);
    }

    /**
     * Formats data for consistent display.
     * @param data - Data to format
     * @returns Formatted string representation
     */
    protected formatData(data: unknown): string {
        if (data instanceof Error) return data.stack ?? data.message;
        if (typeof data === 'object' && data !== null)
            return JSON.stringify(data, null, 2);
        if (typeof data === 'number') return data.toString();

        return String(data);
    }
}
