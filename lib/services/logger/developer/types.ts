import * as CONSTS from '@lib/services/logger/developer/consts';

export type TLogLevelKey = keyof typeof CONSTS.LOG_LEVEL;
export type TLogLevelValue = (typeof CONSTS.LOG_LEVEL)[TLogLevelKey];

/** Interface for configuring logger behaviour */
export interface ILoggerConfig {
    minLevel: TLogLevelValue;
    outputFile?: string;
    userFacing?: boolean;
}
