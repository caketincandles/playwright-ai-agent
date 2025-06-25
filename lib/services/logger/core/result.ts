import * as CONSTS from '../consts';
import * as Types from '../types';
import { LoggerService } from '.';

export class LoggerResultService extends LoggerService {
    /**
     * Logs structured recommendations for test improvements.
     * @param recommendation - Recommendation data with metadata
     */
    public async recommendation(
        recommendation: Types.IRecommendation,
    ): Promise<void> {
        const { type, severity, message, file, line, suggestion, autoFixable } =
            recommendation;

        const prefix = autoFixable ? '🔧' : '💡';
        const location = this.formatLocation(file, line);
        const logMessage = `${prefix} [${type.toUpperCase()}] ${message}${location}`;

        const level = this.mapSeverityToLevel(severity);
        this.log(level, logMessage);

        if (suggestion) this.printDetails(suggestion, CONSTS.LOG_COLOUR[level]);

        await this.writeToFile('recommendation', recommendation);
    }

    /**
     * Logs heal operation results with comprehensive summary.
     * @param result - Heal operation results
     */
    public async healResult(result: Types.IHealResult): Promise<void> {
        const { success, changes, filesModified } = result;

        if (success) {
            this.success('Heal operation completed');
            if (filesModified?.length) {
                this.info(
                    `Modified ${filesModified.length.toString()} files: ${filesModified.join(', ')}`,
                );
            }
        } else this.warn('Heal operation completed with recommendations only');

        this.info(`Generated ${changes.length.toString()} recommendations`);

        for (const change of changes) {
            await this.recommendation(change);
        }

        await this.writeToFile('heal_result', result);
    }

    /**
     * Formats file location for display.
     * @param file - File path
     * @param line - Line number
     * @returns Formatted location string
     */
    private formatLocation(file?: string, line?: number): string {
        if (!file) return '';
        if (line) return ` (${file}:${line.toString()})`;
        return ` (${file})`;
    }

    /**
     * Maps recommendation severity to log level.
     * @param severity - Recommendation severity
     * @returns Corresponding log level
     */
    private mapSeverityToLevel(
        severity: Types.IRecommendation['severity'],
    ): Types.TLogLevelValue {
        switch (severity) {
            case 'ERROR':
                return CONSTS.LOG_LEVEL.ERROR;
            case 'WARN':
                return CONSTS.LOG_LEVEL.WARN;
            case 'INFO':
                return CONSTS.LOG_LEVEL.INFO;
            default:
                return CONSTS.LOG_LEVEL.INFO;
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
                ...(data && typeof data === 'object' && !Array.isArray(data)
                    ? data
                    : { data }),
            };

            const line = JSON.stringify(entry) + '\n';
            await this.fileService.appendFile(this.config.outputFile, line);
        } catch (writeError) {
            this.warn('Failed to write to log file', writeError);
        }
    }
}
