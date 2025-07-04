import * as CONSTS from '@src/services/consts';

/** Primary service type */
export type TServiceType = (typeof CONSTS.SERVICE)[keyof typeof CONSTS.SERVICE];

/** Target type for operations */
export type TTargetType = (typeof CONSTS.TARGET)[keyof typeof CONSTS.TARGET];
