import * as Developer from '@lib/services/logger/developer';
import * as Consumer from '@lib/services/logger/consumer';

export class Logger {
    private readonly _developer: Developer.Log;
    private _consumer?: Consumer.Log;

    constructor(config?: Consumer.Types.IConfig){
        this._developer = new Developer.Log();
        if (config) this._consumer = new Consumer.Log(config);
    }

    public get Dev(): Developer.Log {
        return this._developer;
    }

    public Consumer(config?: Consumer.Types.IConfig): Consumer.Log {
        if (this._consumer) return this._consumer;
        
        if (!config) {
            throw new Error('Consumer logger config required: pass via constructor or function');
        }
        
        return this._consumer = new Consumer.Log(config);
    }
}
