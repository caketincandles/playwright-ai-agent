import * as Developer from '@lib/services/logger/developer';
import * as Consumer from '@lib/services/logger/consumer';

export { Developer, Consumer };

export interface ILogger {
    readonly dev: Developer.Log;
    consumer(config: Consumer.Types.IConfig): Consumer.Log;
}

class Log implements ILogger{
    private readonly _developer = new Developer.Log();

    /** Developer logger - always available, no configuration needed */
    public get dev(): Developer.Log {
        return this._developer;
    }

    /**
     * Consumer logger - configured once on first use, then reused
     * @param config - Required on first call, ignored on subsequent calls
     */
    public consumer(config: Consumer.Types.IConfig): Consumer.Log {        
        return new Consumer.Log(config);
    }
}

export const logger = new Log();
export const devLog = logger.dev;