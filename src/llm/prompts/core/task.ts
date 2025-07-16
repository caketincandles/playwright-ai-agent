import * as Config from '@src/config';

export const MAIN_OBJECTIVE: Record<Config.Types.TServiceType, string> = {
    [Config.CONSTS.SERVICE.CREATE]:
        'You are contributing to the generation of new code for the Automated Test Suite',
    [Config.CONSTS.SERVICE.HEAL]:
        'You are repairing broken or failing code to restore functionality within the Automated Test Suite',
    [Config.CONSTS.SERVICE.IMPROVE]:
        'You are enhancing existing code in the Automated Test Suite',
} as const;

export const INSTRUCTIONS: Record<Config.Types.TServiceType, string> = {
    [Config.CONSTS.SERVICE.CREATE]:
        `1. Access the URL (and slug if seperate) provided
    2. Determine which locators are unique to the page, ignoring global elements such as site navigation bars using the code summary and good judgement
    3. Semantically gauge potential user actions and journeys
    4. Create the appropriate `,
    [Config.CONSTS.SERVICE.HEAL]:
        `1. Examine the failing code context and understand what the original intent was
    2. Perform static analysis of the provided code to find any potential errors
    3. Analyse the provided error message, stack trace, or failure description if provided to identify the root cause of a failure
    4. Apply the minimal necessary changes to resolve issues without altering unrelated functionality
    5. Verify your fix addresses the underlying issue, not just the visible symptom
    6. Preserve all existing test coverage, assertions and verification points
    7. Ensure the repaired code maintains the same logical flow and business intent as the original`,
    [Config.CONSTS.SERVICE.IMPROVE]: '',
} as const;
