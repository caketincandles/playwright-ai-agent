import * as CONSTS from './consts';
import * as Broker from './broker/types';

export { Broker };

export type TRole = (typeof CONSTS.ROLE)[keyof typeof CONSTS.ROLE];
export type TName = (typeof CONSTS.PROVIDERS)[keyof typeof CONSTS.PROVIDERS];
