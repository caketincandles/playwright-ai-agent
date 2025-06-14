import process from 'process';
import * as CONSTS from './consts';
import * as Types from './types';
import { FileService } from '../file';
import { IFileService } from '../file/types';

/**
 * Enhanced logging system for AI automation operations.
 * Provides structured output, file logging, and process management for errors vs warnings.
 */
export class LoggerService {
    private config: Types.ILoggerConfig;

    constructor(
        private readonly tag: Types.ILogTag,
        config?: Partial<Types.ILoggerConfig>,
        private readonly fileService: IFileService = new FileService()
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
    error(message: string, error?: unknown, exitCode: number = 1): never {
        const suffix = this.config.userFacing ? '' : '.';
        this.log(CONSTS.LOG_LEVEL.ERROR, '❌ ' + message + suffix);
        this.printDetails(error, CONSTS.LOG_COLOUR[CONSTS.LOG_LEVEL.ERROR]);
        
        // Always exit on errors to ensure failures are caught
        process.exit(exitCode);
    }

    /**
     * Logs structured recommendations for test improvements.
     * @param recommendation - Recommendation data with metadata
     */
    async recommendation(recommendation: Types.IRecommendation): Promise<void> {
        const { type, severity, message, file, line, suggestion, autoFixable } = recommendation;
        
        const prefix = autoFixable ? '🔧' : '💡';
        const location = this.formatLocation(file, line);
        const logMessage = `${prefix} [${type.toUpperCase()}] ${message}${location}`;
        
        const level = this.mapSeverityToLevel(severity);
        this.log(level, logMessage);
        
        if (suggestion) {
            this.printDetails(suggestion, CONSTS.LOG_COLOUR[level]);
        }
        
        await this.writeToFile('recommendation', recommendation);
    }

    /**
     * Logs heal operation results with comprehensive summary.
     * @param result - Heal operation results
     */
    async healResult(result: Types.IHealResult): Promise<void> {
        const { success, changes, filesModified } = result;
        
        if (success) {
            this.success('Heal operation completed');
            if (filesModified?.length) {
                this.info(`Modified ${filesModified.length} files: ${filesModified.join(', ')}`);
            }
        } else {
            this.warn('Heal operation completed with recommendations only');
        }
        
        this.info(`Generated ${changes.length} recommendations`);
        
        for (const change of changes) {
            await this.recommendation(change);
        }
        
        await this.writeToFile('heal_result', result);
    }

    /**
     * Configures file output for persistent logging.
     * @param filepath - Path to log file
     */
    setOutputFile(filepath: string): void {
        this.config.outputFile = filepath;
    }

    /**
     * Creates a child logger with additional tag context.
     * @param additionalTag - Additional tag information
     * @returns New logger instance with combined tags
     */
    child(additionalTag: Partial<Types.ILogTag>): LoggerService {
        const combinedTag = { ...this.tag, ...additionalTag };
        return new LoggerService(combinedTag, this.config);
    }

    /**
     * Formats file location for display.
     * @param file - File path
     * @param line - Line number
     * @returns Formatted location string
     */
    private formatLocation(file?: string, line?: number): string {
        if (!file) return '';
        if (line) return ` (${file}:${line})`;
        return ` (${file})`;
    }

    /**
     * Maps recommendation severity to log level.
     * @param severity - Recommendation severity
     * @returns Corresponding log level
     */
    private mapSeverityToLevel(severity: Types.IRecommendation['severity']): Types.TLogLevelValue {
        switch (severity) {
            case 'ERROR': return CONSTS.LOG_LEVEL.ERROR;
            case 'WARN': return CONSTS.LOG_LEVEL.WARN;
            case 'INFO': return CONSTS.LOG_LEVEL.INFO;
            default: return CONSTS.LOG_LEVEL.INFO;
        }
    }

    /**
     * Writes structured data to configured output file.
     * @param type - Entry type for categorization
     * @param data - Data to write
     */
    private async writeToFile(type: string, data: unknown): Promise<void> {
        if (!this.config.outputFile) return;
    
        try {
            const entry = {
                timestamp: new Date().toISOString(),
                tag: this.tag,
                type,
                ...(data && typeof data === 'object' && !Array.isArray(data) ? data : { data })
            };
        
            const line = JSON.stringify(entry) + '\n';
            await this.fileService.appendFile(this.config.outputFile, line);
        } catch (writeError) {
            this.warn('Failed to write to log file', writeError);
        }
    }

    /**
     * Core logging method with level filtering and formatting.
     * @param level - Log level for the message
     * @param message - Message to log
     * @param details - Additional data to include
     */
    private log(level: Types.TLogLevelValue, message: string, details?: unknown): void {
        if (level < this.config.minLevel) return;
        
        const timestamp = this.config.showTimestamp ? `[${new Date().toISOString()}] ` : '';
        const levelLabel = CONSTS.LOG_COLOUR[level](CONSTS.LOG_LEVEL_REVERSE[level]);
        const serviceTag = CONSTS.SERVICE_COLOUR[this.tag.service](`[${this.tag.service}]`);
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
    private printDetails(data: unknown, colorFn: (text: string) => string): void {
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
    private formatData(data: unknown): string {
        if (data instanceof Error) return data.stack ?? data.message;
        if (typeof data === 'object' && data !== null) return JSON.stringify(data, null, 2);
        if (typeof data === 'number') return data.toString();
        
        return String(data);
    }
}
