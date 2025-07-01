import * as BROKER from '@src/llm/broker/consts';

export { BROKER };

/** Strongly typed provider names */
export const PROVIDERS = {
    OPEN_AI: 'openai',
    ANTHROPIC: 'anthropic',
    LOCAL: 'local',
} as const;

export const PROVIDER_MODELS = {
    [PROVIDERS.OPEN_AI]: {
        GPT_4: 'gpt-4',
        GPT_4_TURBO: 'gpt-4-turbo',
        GPT_3_5_TURBO: 'gpt-3.5-turbo',
    } as const,
    [PROVIDERS.ANTHROPIC]: {
        CLAUDE_3_SONNET: 'claude-3-sonnet-20240229',
        CLAUDE_3_OPUS: 'claude-3-opus-20240229',
        CLAUDE_3_HAIKU: 'claude-3-haiku-20240307',
    } as const,
    [PROVIDERS.LOCAL]: {} as const,
} as const;

export const ROLE = {
    ASSISTANT: 'assistant', // assistant prompts are the llm responses
    SYS: 'system', // system prompts are the base level prompts, user prompts are added
    USER: 'user', // user prompts represent a person
} as const;

export const SERVICE = {
    HEAL: 'Heal',
} as const;

export const RESPONSE_SCHEMA = {
    filePath: { type: 'string', optional: false },
    fileContents: { type: 'string', optional: false },
    changeLog: { type: 'string[]', optional: true },
    recommendations: {
        type: '{ snippet: string, reason: string }[]',
        optional: true,
    },
} as const;

export const RESPONSE_FORMAT = () => {
    const fields = Object.entries(RESPONSE_SCHEMA)
        .map(([key, config]) => {
            const optional = config.optional ? '?' : '';
            return `${key}${optional}: ${config.type}`;
        })
        .join('; ');
    return `{ ${fields} }`;
};
