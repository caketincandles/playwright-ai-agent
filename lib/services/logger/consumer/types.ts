import * as CONSTS from '@src/services/consts';

/** Primary service type */
export type TServiceType = (typeof CONSTS.SERVICE)[keyof typeof CONSTS.SERVICE];

/** Target type for operations */
export type TTargetType = (typeof CONSTS.TARGET)[keyof typeof CONSTS.TARGET];

export interface IConsumerConfig {
    service: TServiceType;
    target?: TTargetType;
}

export interface IConsumerLog {
    filePath: string;
    changeLog?: string[]; 
    recommendations?: { 
        snippet: string, 
        reason: string,
    }[];
}
