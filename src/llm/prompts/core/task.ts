import * as Config from '@src/config';

export const MAIN_OBJECTIVE: Record<Config.Types.TServiceType, string> = {
    [Config.CONSTS.SERVICE.CREATE]: '',
    [Config.CONSTS.SERVICE.HEAL]:
        'You are repairing broken or failing code to restore functionality',
    [Config.CONSTS.SERVICE.IMPROVE]: '',
} as const;

export const INSTRUCTIONS: Record<Config.Types.TServiceType, string[]> = {
    [Config.CONSTS.SERVICE.CREATE]: [],
    [Config.CONSTS.SERVICE.HEAL]: [
        'Examine the failing code context and understand what the original intent was',
        'Perform static analysis of the provided code to find any potential errors',
        'Analyse the provided error message, stack trace, or failure description if provided to identify the root cause of a failure',
        'Apply the minimal necessary changes to resolve issues without altering unrelated functionality',
        'Verify your fix addresses the underlying issue, not just the visible symptom',
        'Preserve all existing test coverage, assertions and verification points',
        'Ensure the repaired code maintains the same logical flow and business intent as the original',
    ],
    [Config.CONSTS.SERVICE.IMPROVE]: [],
} as const;
