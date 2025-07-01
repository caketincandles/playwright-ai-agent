import * as Types from '@src/services/types';
import * as Broker from '@src/llm/broker';
import * as Prompt from '@src/llm/prompts';
import { IConfig } from '@src/config/types';
import { TResponseSchema } from './types';
import { RESPONSE_SCHEMA } from './consts';

export class Llm {
    private readonly broker: Broker.Llm;

    constructor(
        private readonly config: IConfig,
        private readonly service: Types.TServiceType,
        private readonly target: Types.TTargetType[],
    ) {
        this.broker = new Broker.Llm({ config: this.config.ai });
    }

    public async getResponse(filePaths: string[]): Promise<TResponseSchema> {
        const prompt = new Prompt.Factory(
            filePaths,
            this.service,
            this.config,
            this.target,
        );
        const rawResponse = await prompt.createPrompt();
        return this.parseResponse(rawResponse);
    }

    private parseResponse(raw: string): TResponseSchema {
        const jsonString = this.extractAndFixJSON(raw);
        if (!jsonString) throw new Error('No valid JSON found');

        try {
            return this.validate(JSON.parse(jsonString));
        } catch {
            throw new Error('Invalid JSON response from LLM');
        }
    }

    private extractAndFixJSON(raw: string): string | null {
        // Extract JSON between first '{' and last '}' - just in case...
        const start = raw.indexOf('{');
        const end = raw.lastIndexOf('}');
        if (start === -1 || end === -1 || start >= end) return null;

        return raw
            .substring(start, end + 1)
            .replace(/,(\s*[}\]])/g, '$1') // trailing commas
            .replace(/'/g, '"') // single to double quotes
            .replace(/([{,]\s*)([a-zA-Z_]\w*)\s*:/g, '$1"$2":'); // unquoted keys
    }

    private validate(data: unknown): TResponseSchema {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data structure');
        }

        const obj = data as Record<string, unknown>;
        const result: Record<string, unknown> = {};

        for (const [key, schema] of Object.entries(RESPONSE_SCHEMA)) {
            const value = obj[key];

            if (value == null) {
                if (!schema.optional) throw new Error(`Missing: ${key}`);
                continue;
            }

            result[key] = this.validateField(key, value, schema.type);
        }

        return result as TResponseSchema;
    }

    private validateField(key: string, value: unknown, type: string): unknown {
        switch (type) {
            case 'string':
                if (typeof value !== 'string')
                    throw new Error(`${key} must be string`);
                return value;

            case 'string[]':
                if (
                    !Array.isArray(value) ||
                    !value.every((v) => typeof v === 'string')
                ) {
                    throw new Error(`${key} must be string array`);
                }
                return value;

            case '{ snippet: string, reason: string }[]':
                if (
                    !Array.isArray(value) ||
                    !value.every(this.isValidRecommendation)
                ) {
                    throw new Error(`${key} must be recommendation array`);
                }
                return value;

            default:
                throw new Error(`Unknown type: ${type}`);
        }
    }

    private isValidRecommendation = (
        item: unknown,
    ): item is { snippet: string; reason: string } => {
        return (
            typeof item === 'object' &&
            item != null &&
            'snippet' in item &&
            'reason' in item &&
            typeof (item as Record<string, unknown>).snippet === 'string' &&
            typeof (item as Record<string, unknown>).reason === 'string'
        );
    };
}
