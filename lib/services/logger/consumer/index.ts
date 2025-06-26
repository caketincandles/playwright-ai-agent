import process from 'process';
import chalk from 'chalk';
import * as Types from '@lib/services/logger/consumer/types';
import * as CONSTS from '@lib/services/logger/consumer/consts';

export { CONSTS, Types };

export class Consumer {
    private readonly tag: string;

    constructor(private readonly config: Types.IConsumerConfig){
        this.tag = this.formatTag;
    }

public log(details: Types.IConsumerLog): void {
    const timestamp = new Date().toISOString();
    const prefix = `${timestamp} ${this.tag} - Changes and recommendations are as follows: \n\n`;
    const result = this.formatOutput(details);
    process.stdout.write(`${prefix}${result}`);
}

private formatOutput(details: Types.IConsumerLog): string {
    if (!details.changeLog && !details.recommendations) {
        return chalk.dim(`${details.filePath} has no changes or recommendations`) + '\n';
    }

    const parts: string[] = [
        chalk.bold(details.filePath + ':'),
        '\n\n'
    ];

    if (details.changeLog) {
        parts.push(
            chalk.bold.inverse('CHANGELOG'),
            '\n'
        );
        for (const change of details.changeLog) {
            parts.push(`    - ${change}\n`);
        }
        parts.push('\n\n');
    }

    if (details.recommendations) {
        parts.push(
            chalk.bold.inverse('RECOMMENDATIONS'),
            '\n'
        );
        for (const recommendation of details.recommendations) {
            parts.push(
                chalk.green(recommendation.snippet),
                '\n',
                chalk.dim.italic(recommendation.reason),
                '\n\n'
            );
        }
        parts.push('\n\n');
    }

    parts.push('~~~~~~~~~~~~~~~~~~~~\n');

    return parts.join('');
}

    private get formatTag(): string {
        const str = this.config.target ? `${this.config.service}.${this.config.target}` : this.config.service;
        return CONSTS.COLOUR_MAP[this.config.service](`[${str}]`);
    }
}
