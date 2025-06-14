import * as Types from '../types';
import * as CONSTS from '../consts';

/** Mock logger service for development and testing - captures all log messages for debugging */
export class MockLoggerService {
    private config: Types.ILoggerConfig;
    private messages: {
        level: Types.TLogLevelValue;
        message: string;
        details?: unknown;
        timestamp: Date;
        tag: Types.ILogTag;
    }[] = [];

    constructor(
        private readonly tag: Types.ILogTag,
        config: Partial<Types.ILoggerConfig> = {},
    ) {
        this.config = { ...CONSTS.DEFAULT_LOG_CONFIG, ...config };
    }

    debug(message: string, details?: unknown): void {
        this.capture(CONSTS.LOG_LEVEL.DEBUG, message, details);
    }

    info(message: string, details?: unknown): void {
        this.capture(CONSTS.LOG_LEVEL.INFO, message, details);
    }

    success(message: string, details?: unknown): void {
        this.capture(CONSTS.LOG_LEVEL.SUCCESS, message, details);
    }

    warn(message: string, details?: unknown): void {
        this.capture(CONSTS.LOG_LEVEL.WARN, message, details);
    }

    error(message: string, error?: unknown): never {
        this.capture(CONSTS.LOG_LEVEL.ERROR, message, error);
        throw new Error(`Mock Logger Error: ${message}`); // don't actually exit process
    }

    recommendation(recommendation: Types.IRecommendation): void {
        this.capture(
            this.mapSeverityToLevel(recommendation.severity),
            `[RECOMMENDATION] ${recommendation.message}`,
            recommendation,
        );
    }

    healResult(result: Types.IHealResult): void {
        this.capture(
            CONSTS.LOG_LEVEL.INFO,
            `[HEAL] Operation completed: ${result.success.toString()}`,
            result,
        );
    }

    setOutputFile(): void {
        return;
    }

    child(additionalTag: Partial<Types.ILogTag>): MockLoggerService {
        const combinedTag = { ...this.tag, ...additionalTag };
        return new MockLoggerService(combinedTag, this.config);
    }

    // Mock-specific methods for testing and debugging
    /** Gets all captured log messages */
    getCapturedMessages(): {
        level: Types.TLogLevelValue;
        message: string;
        details?: unknown;
        timestamp: Date;
        tag: Types.ILogTag;
    }[] {
        return [...this.messages];
    }

    /** Gets messages by log level */
    getMessagesByLevel(level: Types.TLogLevelValue): string[] {
        return this.messages
            .filter((msg) => msg.level === level)
            .map((msg) => msg.message);
    }

    /** Checks if a specific message was logged */
    hasMessage(message: string, level?: Types.TLogLevelValue): boolean {
        return this.messages.some(
            (msg) =>
                msg.message.includes(message) &&
                (level === undefined || msg.level === level),
        );
    }

    /** Gets the last logged message */
    getLastMessage(): string | undefined {
        const last = this.messages[this.messages.length - 1];
        return last.message;
    }

    /** Clears all captured messages */
    clearMessages(): void {
        this.messages = [];
    }

    /** Gets count of messages by level */
    getMessageCount(level?: Types.TLogLevelValue): number {
        if (level === undefined) return this.messages.length;
        return this.messages.filter((msg) => msg.level === level).length;
    }

    /** Prints all captured messages to console (for debug) */
    printCapturedMessages(): void {
        console.log('=== Mock Logger Captured Messages ===');
        this.messages.forEach((msg, index) => {
            const levelName = CONSTS.LOG_LEVEL_REVERSE[msg.level];
            console.log(
                `${(index + 1).toString()}. [${levelName}] ${msg.message}`,
            );
            if (msg.details) {
                console.log('   Details:', msg.details);
            }
        });
        console.log('=====================================');
    }

    private capture(
        level: Types.TLogLevelValue,
        message: string,
        details?: unknown,
    ): void {
        if (level < this.config.minLevel) return;

        this.messages.push({
            level,
            message,
            details,
            timestamp: new Date(),
            tag: this.tag,
        });

        if (process.env.NODE_ENV === 'development') {
            const levelName = CONSTS.LOG_LEVEL_REVERSE[level];
            console.log(`[MOCK ${levelName}] ${message}`);
        }
    }

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
}

/** Mock logger factory that returns MockLoggerService instances */
export class MockLoggerManager {
    private loggers = new Map<string, MockLoggerService>();
    private globalConfig: Partial<Types.ILoggerConfig> = {};

    setGlobalConfig(config: Partial<Types.ILoggerConfig>): void {
        this.globalConfig = { ...config };
    }

    getLogger(
        tag: Types.ILogTag,
        config?: Partial<Types.ILoggerConfig>,
    ): MockLoggerService {
        const key = `${tag.service}:${tag.target ?? 'default'}`;

        if (!this.loggers.has(key)) {
            const mergedConfig = {
                ...CONSTS.DEFAULT_LOG_CONFIG,
                ...this.globalConfig,
                ...config,
            };
            this.loggers.set(key, new MockLoggerService(tag, mergedConfig));
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.loggers.get(key)!;
    }

    /** Gets all logger instances for inspection */
    getAllLoggers(): Map<string, MockLoggerService> {
        return new Map(this.loggers);
    }

    /** Clears all messages from all loggers */
    clearAllMessages(): void {
        this.loggers.forEach((logger) => {
            logger.clearMessages();
        });
    }

    /** Gets total message count across all loggers */
    getTotalMessageCount(): number {
        let total = 0;
        this.loggers.forEach((logger) => {
            total += logger.getMessageCount();
        });
        return total;
    }
}

export const mockLoggerManager = new MockLoggerManager();
