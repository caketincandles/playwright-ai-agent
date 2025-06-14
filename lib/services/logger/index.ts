import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import * as CONSTS from './consts';
import * as Types from './types';

/**
 * Enhanced Logger class for AI agent operations
 * Provides methods for different log levels, file output, and structured recommendations
 */
export class Logger {
    private config: Types.ILoggerConfig;

    constructor(
        private readonly tag: Types.ILogTag,
        config?: Partial<Types.ILoggerConfig>,
    ) {
        this.config = { ...CONSTS.DEFAULT_LOG_CONFIG, ...config };
    }

    /**
     * Logs a debug message (only visible when debug level is enabled)
     * @param message - semantic debug message
     * @param args - additional arguments to log
     */
    debug(message: string, ...args: readonly unknown[]): void {
        this.log(CONSTS.LOG_LEVEL.DEBUG, message, args);
    }

    /**
     * Logs an informational message
     * @param message - semantic info message
     * @param args - additional arguments to log
     */
    info(message: string, ...args: readonly unknown[]): void {
        const suffix = this.config.userFacing ? '' : '...';
        this.log(CONSTS.LOG_LEVEL.INFO, message + suffix, args);
    }

    /**
     * Logs a success message
     * @param message - semantic success message
     * @param args - additional arguments to log
     */
    success(message: string, ...args: readonly unknown[]): void {
        const prefix = this.config.userFacing ? '✅ ' : '✅ ';
        const suffix = this.config.userFacing ? '' : '!';
        this.log(CONSTS.LOG_LEVEL.SUCCESS, prefix + message + suffix, args);
    }

    /**
     * Logs a warning message
     * @param message - semantic warning message
     * @param args - additional arguments to log (e.g. non-breaking errors)
     */
    warn(message: string, ...args: unknown[]): void {
        const suffix = this.config.userFacing ? '' : '.';
        this.log(CONSTS.LOG_LEVEL.WARN, '⚠️ ' + message + suffix, []);
        this.printDetails(args, CONSTS.LOG_COLOUR[CONSTS.LOG_LEVEL.WARN]);
    }

    /**
     * Logs an error message
     * @param message - semantic error message
     * @param error - error object to include stdout details
     */
    error(message: string, error?: unknown): void {
        const suffix = this.config.userFacing ? '' : '.';
        this.log(CONSTS.LOG_LEVEL.ERROR, '❌ ' + message + suffix, [error]);
        this.printDetails(
            [error ?? 'Unknown error'],
            CONSTS.LOG_COLOUR[CONSTS.LOG_LEVEL.ERROR],
        );
    }

    /**
     * Logs a recommendation with structured output
     * @param recommendation - structured recommendation data
     */
    async recommendation(recommendation: Types.IRecommendation): Promise<void> {
        const { type, severity, message, file, line, suggestion, autoFixable } = recommendation;
        
        const prefix = autoFixable ? '🔧' : '💡';
        const location = file && line ? ` (${file}:${line.toString()})` : file ? ` (${file})` : '';
        const logMessage = `${prefix} [${type.toUpperCase()}] ${message}${location}`;
        
        const level = severity === 'error' ? CONSTS.LOG_LEVEL.ERROR : 
                     severity === 'warning' ? CONSTS.LOG_LEVEL.WARN : CONSTS.LOG_LEVEL.INFO;
        this.log(level, logMessage, suggestion ? [suggestion] : []);
        
        // Write to file if configured
        if (this.config.outputFile) {
            await this.writeRecommendationToFile(recommendation);
        }
    }

    /**
     * Logs heal operation results
     * @param result - heal operation result data
     */
    async healResult(result: Types.IHealResult): Promise<void> {
        const { success, changes, filesModified } = result;
        
        if (success) {
            this.success(`Heal operation completed`);
            if (filesModified && filesModified.length > 0) {
                this.info(`Modified files: ${filesModified.join(', ')}`);
            }
        } else {
            this.warn('Heal operation completed with recommendations only');
        }
        
        this.info(`Found ${changes.length.toString()} recommendations`);
        
        for (const change of changes) {
            await this.recommendation(change);
        }
        
        if (this.config.outputFile) await this.writeHealResultToFile(result);
    }

    /**
     * Sets the output file for recommendations
     * @param filepath - path to output file
     */
    setOutputFile(filepath: string): void {
        this.config.outputFile = filepath;
    }

    /**
     * Writes a recommendation to the configured output file
     * @param recommendation - recommendation to write
     */
    private async writeRecommendationToFile(recommendation: Types.IRecommendation): Promise<void> {
        if (!this.config.outputFile) return;
        
        try {
            const outputDir = path.dirname(this.config.outputFile);
            await fs.mkdir(outputDir, { recursive: true });
            
            const timestamp = new Date().toISOString();
            const entry = {
                timestamp,
                tag: this.tag,
                ...recommendation,
            };
            
            const line = JSON.stringify(entry) + '\n';
            await fs.appendFile(this.config.outputFile, line);
        } catch (error) {
            this.error('Failed to write recommendation to file', error);
        }
    }

    /**
     * Writes heal results to the configured output file
     * @param result - heal result to write
     */
    private async writeHealResultToFile(result: Types.IHealResult): Promise<void> {
        if (!this.config.outputFile) return;
        
        try {
            const outputDir = path.dirname(this.config.outputFile);
            await fs.mkdir(outputDir, { recursive: true });
            
            const entry = {
                tag: this.tag,
                operation: 'heal_summary',
                ...result,
            };
            
            const line = JSON.stringify(entry, null, 2) + '\n';
            await fs.appendFile(this.config.outputFile, line);
        } catch (error) {
            this.error('Failed to write heal result to file', error);
        }
    }

    /**
     * Internal method to log according to level and apply formatting
     * @param level - log level
     * @param message - message to log
     * @param args - additional arguments to log
     */
    private log(
        level: Types.TLogLevelValue,
        message: string,
        args?: readonly unknown[],
    ): void {
        if (level < this.config.minLevel) return;
        
        const prefix = CONSTS.LOG_COLOUR[level](CONSTS.LOG_LEVEL_REVERSE[level]);
        const timestamp = this.config.showTimestamp
            ? `[${new Date().toISOString()}] `
            : '';
        
        // Format hierarchical tags: [Service] [_Target_]
        const serviceTag = CONSTS.SERVICE_COLOUR[this.tag.service](`[${this.tag.service}]`);
        const targetTag = this.tag.target 
            ? ` ${CONSTS.TARGET_COLOUR[this.tag.target](`[_${this.tag.target}_]`)}`
            : '';
        
        process.stdout.write(
            `${timestamp}${prefix} ${serviceTag}${targetTag}: ${message}\n`,
        );

        if (args) {
            for (const arg of args) {
                if (arg === undefined) {
                    continue;
                }
                const output = this.formatArgument(arg);
                process.stdout.write(`${output}\n`);
            }
        }
    }

    /**
     * Formats an argument for logging output
     * @param arg - argument to format
     * @returns formatted string representation
     */
    private formatArgument(arg: unknown): string {
        if (typeof arg === 'object' && arg !== null) {
            return JSON.stringify(arg, null, 2);
        }
        if (typeof arg === 'number') return arg.toString();
        return String(arg);
    }

    /**
     * Prints detailed information for warnings and errors
     * @param items - items to print for information
     * @param colour - colour function to apply to the output for readability
     */
    private printDetails(items: unknown[], colour: (text: string) => string): void {
        for (const item of items) {
            const detail =
                item instanceof Error
                    ? (item.stack ?? item.message)
                    : String(item);
            process.stderr.write(`${colour(detail)}\n`);
        }
    }
}
