import * as CONSTS from './consts';

/** Log level type */
export type TLogLevelKey = keyof typeof CONSTS.LOG_LEVEL;
export type TLogLevelValue = (typeof CONSTS.LOG_LEVEL)[TLogLevelKey];

/** Primary service type */
export type TServiceType = (typeof CONSTS.SERVICE)[keyof typeof CONSTS.SERVICE];

/** Target type for operations */
export type TTargetType = (typeof CONSTS.TARGET)[keyof typeof CONSTS.TARGET];

/** Combined log tag structure */
export interface ILogTag {
    readonly service: TServiceType;
    readonly target?: TTargetType;
}

/** Interface for configuring logger behaviour */
export interface ILoggerConfig {
    minLevel: TLogLevelValue;
    showTimestamp: boolean;
    outputFile?: string;
    userFacing?: boolean;
}

/** Interface for customisation of log text appearance */
export interface ITextOptions {
    readonly background?: (text: string) => string;
    readonly textColour?: (text: string) => string;
    readonly style?:
        | ((text: string) => string)
        | readonly ((text: string) => string)[];
}

/** Interface for structured recommendations output */
export interface IRecommendation {
    readonly type: TTargetType | 'Improvement';
    readonly severity: Omit<TLogLevelKey, 'DEBUG' | 'SUCCESS'>;
    readonly message: string;
    readonly file?: string;
    readonly line?: number;
    readonly suggestion?: string;
    readonly autoFixable?: boolean;
    readonly metadata?: Record<string, unknown>;
}

/** Interface for heal operation results */
export interface IHealResult {
    readonly success: boolean;
    readonly changes: readonly IRecommendation[];
    readonly filesModified?: readonly string[];
    readonly timestamp: string;
}

export interface ILogger {
    debug(message: string, details?: unknown): void;
    info(message: string, details?: unknown): void;
    success(message: string, details?: unknown): void;
    warn(message: string, details?: unknown): void;
    error(message: string, error?: unknown, exitCode?: number): never;
}
