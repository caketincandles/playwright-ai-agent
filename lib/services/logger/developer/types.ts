import * as CONSTS from '@lib/services/logger/developer/consts';

export type TLogLevelKey = keyof typeof CONSTS.LOG_LEVEL;
export type TLogLevelValue = (typeof CONSTS.LOG_LEVEL)[TLogLevelKey];

export interface IDeveloperLog {
    message: string;
    details?: unknown;
}
