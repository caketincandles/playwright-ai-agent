import { SERVICE } from '@src/llm/consts';
import { TService } from '@src/llm/types';
import { TAction, TPlaywrightFile } from '@src/llm/prompts/types';
import { ACTION, PLAYWRIGHT_FILE } from '@src/llm/prompts/consts';

const BASE_RULES: string[] = [
    'Response format: { filePath: string; fileContents: string }[]',
    'Use `unknown` over `any`; maintain TypeScript types, interfaces, and generics',
    'Preserve performance optimisations; avoid overhead unless necessary',
    'Minimal comments for non-obvious changes only; update existing comments if inaccurate',
    'Access provided URLs to capture DOM when available',
    'Apply OOP, DRY, and KISS principles; preserve encapsulation and method signatures',
    'Code must compile and execute; add debugging context only when beneficial',
] as const;

const UPDATE_BASE_RULES: string[] = [
    'Preserve imports, exports, and module structure',
    'Assume external references work as described; do not redeclare',
    'Minimal changes to resolve specific issues; avoid overengineering',
    'Prevent impact on other areas; comment potential breaking changes (e.g. typos affecting references)',
    'Maintain file formatting and indentation consistency',
] as const;

const GENERATE_BASE_RULES: string[] = [
    'Follow linter/beautifier configs when provided',
    'Create robust, maintainable code following project patterns',
    'Use semantic naming conventions and clear abstractions',
    'Implement proper error handling and validation',
    'Generate comprehensive test coverage for critical paths',
] as const;

const ACTION_RULES = {
    [ACTION.GENERATE]: {
        [PLAYWRIGHT_FILE.LOCATOR]: [
            ...GENERATE_BASE_RULES,
            'Create reusable locator methods with descriptive names',
            'Use data-testid as primary strategy; fallback to role, label or stable attributes',
            'Avoid positional, index-based or dynamic class selectors',
        ],
        [PLAYWRIGHT_FILE.PAGE]: [
            ...GENERATE_BASE_RULES,
            'Implement complete page interactions with proper waits',
            'Create methods for common workflows and business actions',
            'Include assertion methods for page state validation',
        ],
        [PLAYWRIGHT_FILE.TEST]: [
            ...GENERATE_BASE_RULES,
            'Structure tests with clear arrange-act-assert patterns',
            'Include setup/teardown for test isolation',
            'Cover positive, negative and edge case scenarios',
        ],
    },
    [ACTION.UPDATE]: {
        [PLAYWRIGHT_FILE.LOCATOR]: [
            ...UPDATE_BASE_RULES,
            'Verify new locators target same logical elements',
            'Comment variable name changes that may break references',
        ],
        [PLAYWRIGHT_FILE.PAGE]: [
            ...UPDATE_BASE_RULES,
            'Preserve method signatures and return types',
            'Maintain abstraction levels and business logic separation',
        ],
        [PLAYWRIGHT_FILE.TEST]: [
            ...UPDATE_BASE_RULES,
            'Preserve test intent, coverage scope and logical flow',
            'Maintain verification points and assertion structure',
        ],
    },
} as const satisfies Record<TAction, Record<TPlaywrightFile, string[]>>;

const SERVICE_RULES: Record<TService, string[]> = {
    [SERVICE.HEAL]: [
        ...BASE_RULES,
        'Fix immediate failures only; no additional logic',
        'Target root causes, not symptoms; maintain test flow and verification points',
        'Modify failing code exclusively where possible',
    ],
} as const;

const LOCATOR_RULES: string[] = [
    'Priority: data-testid > role > label > stable attributes > CSS selectors',
    'Avoid dynamic, positional or index-based selectors',
    'Uphold Page Object Model principles; comment breaking changes',
    'Test locator stability across different viewport sizes and states',
] as const;

const PAGE_RULES: string[] = [
    'Preserve assertion strength (`toEqual` vs `toContain`) unless error-justified',
    'Update expected values only when actual behaviour is correct',
    'Use soft assertions sparingly and only for test continuation',
    'Separate page interactions from assertions for clarity',
] as const;

const TIMING_RULES: string[] = [
    'Replace hard waits with explicit condition waits',
    'Use `waitForLoadState`, `waitForSelector`, `waitForResponse` over timeouts',
    'Reasonable timeouts: 5-30s based on context',
    'Ensure elements are visible/enabled before interaction',
] as const;

const INTERACTION_RULES: string[] = [
    'Verify element state before interactions (visible, enabled, stable)',
    'Use force: true only as last resort with justification',
    'Handle dynamic content with proper wait strategies',
    'Implement retry logic for flaky interactions',
] as const;

const NAVIGATION_RULES: string[] = [
    'Use relative URLs for environment flexibility',
    'Preserve URL parameters unless they cause failures',
    'Implement proper page load verification',
    'Handle navigation timing and loading states',
] as const;

const ERROR_HANDLING_RULES: string[] = [
    'Maintain existing try-catch patterns; add context for debugging',
    'Do not suppress errors unless specifically required',
    'Preserve error message formats for logging consistency',
    'Add meaningful error messages for test failures',
] as const;

export const RULES = {
    [SERVICE.HEAL]: {
        [PLAYWRIGHT_FILE.LOCATOR]: [
            ...SERVICE_RULES[SERVICE.HEAL],
            ...LOCATOR_RULES,
            ...ACTION_RULES[ACTION.UPDATE][PLAYWRIGHT_FILE.LOCATOR],
        ],
        [PLAYWRIGHT_FILE.PAGE]: [
            ...SERVICE_RULES[SERVICE.HEAL],
            ...PAGE_RULES,
            ...TIMING_RULES,
            ...INTERACTION_RULES,
            ...ACTION_RULES[ACTION.UPDATE][PLAYWRIGHT_FILE.PAGE],
        ],
        [PLAYWRIGHT_FILE.TEST]: [
            ...SERVICE_RULES[SERVICE.HEAL],
            ...TIMING_RULES,
            ...NAVIGATION_RULES,
            ...ERROR_HANDLING_RULES,
            ...ACTION_RULES[ACTION.UPDATE][PLAYWRIGHT_FILE.TEST],
        ],
    },
} as const satisfies Record<TService, Record<TPlaywrightFile, string[]>>;
