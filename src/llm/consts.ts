import * as BROKER from './broker/consts';

export { BROKER };

/** Strongly typed provider names */
export const PROVIDERS = {
    OPENAI: 'openai',
    ANTHROPIC: 'anthropic',
    LOCAL: 'local',
} as const;

export const ROLE = {
    ASSISTANT: 'assistant', // assistant prompts are the llm responses
    SYS: 'system', // system prompts are the base level prompts, user prompts are added
    USER: 'user', // user prompts represent a person
} as const;
