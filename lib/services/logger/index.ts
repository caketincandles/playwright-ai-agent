import * as CONSTS from './consts';
import * as Types from './types';
import { LoggerService } from './core';

/**
 * Global logger manager for caching and reusing logger instances.
 * Provides centralised configuration and prevents duplicate logger creation.
 */
class LoggerManager {
    private readonly loggers = new Map<string, LoggerService>();
    private globalConfig: Partial<Types.ILoggerConfig> = {};

    /**
     * Sets global configuration for all new loggers.
     * @param config - Global logger configuration
     */
    setGlobalConfig(config: Partial<Types.ILoggerConfig>): void {
        this.globalConfig = { ...config };
    }

    /**
     * Gets or creates a cached logger instance.
     * @param tag - Logger tag for identification
     * @param config - Optional config overrides
     * @returns Cached or new logger instance
     */
    getLogger(
        tag: Types.ILogTag,
        config?: Partial<Types.ILoggerConfig>,
    ): Types.IBaseLogger {
        const key = this.createKey(tag);
        if (!this.loggers.has(key)) {
            const mergedConfig = { ...this.globalConfig, ...config };
            this.loggers.set(key, new LoggerService(tag, mergedConfig));
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.loggers.get(key)!;
    }

    /**
     * Creates unique key for logger caching.
     * @param tag - Logger tag
     * @returns Unique string key
     */
    private createKey(tag: Types.ILogTag): string {
        return `${tag.service}:${tag.target ?? 'default'}`;
    }
}

// Export singleton instance
const logger = new LoggerManager();

export { CONSTS, Types };

export const Log: Record<
    Types.TServiceType,
    (target?: Types.TTargetType) => Types.IBaseLogger
> = {
    [CONSTS.SERVICE.HEAL]: (target?: Types.TTargetType) =>
        logger.getLogger({ service: CONSTS.SERVICE.HEAL, target }),
    [CONSTS.SERVICE.CREATE]: (target?: Types.TTargetType) =>
        logger.getLogger({ service: CONSTS.SERVICE.CREATE, target }),
    [CONSTS.SERVICE.IMPROVE]: (target?: Types.TTargetType) =>
        logger.getLogger({ service: CONSTS.SERVICE.IMPROVE, target }),
    [CONSTS.SERVICE.DEV]: (target?: Types.TTargetType) =>
        logger.getLogger({ service: CONSTS.SERVICE.DEV, target }),
    [CONSTS.SERVICE.INSTALL]: (target?: Types.TTargetType) =>
        logger.getLogger({ service: CONSTS.SERVICE.INSTALL, target }),
};

/**
 * Initialises global logging configuration.
 * Should be called once during package initialisation.
 * @param config - Global configuration object
 */
export function initLogging(config?: {
    readonly level?: Types.TLogLevelKey;
    readonly userFacing?: boolean;
    readonly outputFile?: string;
    readonly showTimestamp?: boolean;
}): void {
    const logConfig: Partial<Types.ILoggerConfig> = {};

    if (config?.level) logConfig.minLevel = CONSTS.LOG_LEVEL[config.level];
    if (config?.userFacing !== undefined)
        logConfig.userFacing = config.userFacing;
    if (config?.outputFile) logConfig.outputFile = config.outputFile;
    if (config?.showTimestamp !== undefined)
        logConfig.showTimestamp = config.showTimestamp;

    logger.setGlobalConfig(logConfig);
}
