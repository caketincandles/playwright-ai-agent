import { RESPONSE_FORMAT } from '@src/llm/consts';
import { TAction } from '@src/llm/prompts/types';
import { ACTION } from '@src/llm/prompts/consts';
import { TARGET, SERVICE } from '@src/services/consts';
import { TServiceType, TTargetType } from '@src/services/types';

const BASE_RULES: readonly string[] = [
    `## CRITICAL: Response format must be EXACTLY: \`${RESPONSE_FORMAT()}[]\` - no other format is acceptable`,
    '### REQUIRED: Populate `changeLog` array with bullet points explaining what changed and why, using max 15 words per entry',
    '### REQUIRED: Each `recommendations` entry must contain executable code snippet under 50 characters and reason under 20 words',
    '### REQUIRED: Sort files by number of changes DESC, then by number of recommendations DESC',
    '### REQUIRED: `fileContent` must contain complete, executable file with all imports, exports, and unchanged code - NEVER partial code',
    'NEVER use `any` type - use `unknown`, specific types, or proper generics; maintain all existing TypeScript strictness',
    'Preserve existing performance patterns; only add overhead if it prevents test failures',
    'Add comments ONLY for complex logic; remove outdated comments; keep comment style consistent with file',
    'When URLs provided, use them to understand DOM structure and element context for better selectors',
    'Follow existing code patterns in the file; maintain method signatures unless they cause failures',
    'Code must pass TypeScript compilation and execute without runtime errors',
    'Write self-documenting code with clear variable names; avoid over-engineering for junior developer comprehension',
    'NEVER make assumptions about external dependencies - work with provided or known interfaces only',
    'TIMEOUT VALUES: 5s for fast operations, 15s for network requests, 30s for complex page loads - justify anything longer',
    'FORCE FLAG: Only use {force: true} as last resort and add comment explaining why normal interaction fails',
    'URL FORMAT: Use relative URLs (/dashboard) not absolute (https://example.com/dashboard) for environment flexibility',
] as const;

const UPDATE_RULES: readonly string[] = [
    ...BASE_RULES,
    '### REQUIRED: Add breaking changes to `recommendations` with exact code snippet and reason - be specific about what breaks',
    'NEVER modify imports/exports unless they directly cause the failure being fixed',
    'NEVER redeclare external types, interfaces, or functions - assume they work as documented',
    'Make minimal targeted changes - modify only the specific lines causing issues',
    'Before changing variable/method names, add recommendation warning about potential reference breaks',
    'Maintain exact indentation, spacing, and formatting style of the original file',
    'When multiple files provided, determine actual scope of necessary changes - do not modify context-only files unless essential',
    'PRIORITY ORDER: Fix immediate issue > Preserve functionality > Maintain patterns > Improve code quality',
    'ERROR MESSAGES: Maintain existing error message formats for logging consistency - add context, do not replace',
    'TRY-CATCH: Preserve existing error handling patterns - only add context or modify catch blocks if needed for debugging',
    'STACK TRACES: Preserve original error stack traces when re-throwing or wrapping errors',
    'PARAMETERS: Preserve URL parameters and query strings unless they directly cause test failures',
] as const;

const GENERATE_RULES: readonly string[] = [
    ...BASE_RULES,
    'CONFIGURATION: Follow provided linter configs (.eslintrc, tsconfig.json) exactly - do not deviate from project standards',
    'PATTERNS: Study existing project files to match naming conventions, folder structure, and code organization',
    'ROBUSTNESS: Include comprehensive error handling, input validation, and graceful failure modes',
    'ABSTRACTIONS: Create clear, single-responsibility classes and methods with intuitive naming',
    'TESTING: Generate code that is easily testable with proper dependency injection and clear interfaces',
    'DOCUMENTATION: Include TSDoc comments for all public methods with parameter and return type descriptions',
] as const;

const LOCATOR_RULES: readonly string[] = [
    'SELECTOR PRIORITY (use first available): data-testid > ARIA role > aria-label > text content > stable attributes > CSS classes > CSS selectors',
    'AVOID: nth-child(), :first, :last, position-based selectors',
    'FORBIDDEN: randomly generated IDs, dynamic class names',
    'Page Object Model: group related locators, use descriptive method names, return Locator objects not ElementHandle',
    'TEST REQUIREMENT: Verify locators work across mobile/desktop viewports and different application states',
    'Use playwright locator methods: getByTestId(), getByRole(), getByLabel(), getByText() over CSS selectors',
    'For complex elements, chain locators: page.getByRole("button").filter({hasText: "Submit"})',
    'FLAKY ELEMENTS: Add retry logic with exponential backoff for unstable elements',
    'DYNAMIC CONTENT: For loading spinners/overlays, wait for them to disappear before interacting with underlying elements',
] as const;

const TEST_RULES: readonly string[] = [
    'ASSERTION STRENGTH: Keep strict assertions (toEqual, toBe) unless test failure proves actual behavior is correct',
    'SOFT ASSERTIONS: Use expect.soft() sparingly and only when test must continue after assertion failure',
    'EXPECTED VALUES: Only change expected values when actual application behavior is verified correct - not just to make tests pass',
] as const;

export const PAGE_RULES: readonly string[] = [
    'SEPARATION: Keep page interactions (clicks, fills) separate from assertions - use different methods',
    'WAIT STRATEGY: Use page.waitForLoadState(), waitForSelector() instead of arbitrary timeouts',
    'RETURN TYPES: Page methods should return Page object for chaining or specific data types for getters',
    'FORBIDDEN: Do not suppress errors with empty catch blocks unless specifically required for test flow',
    'TEST FAILURES: Add descriptive error messages that help identify what went wrong: "Login button not found after 30s wait"',
    'FORBIDDEN: page.waitForTimeout() - use explicit waits: waitForSelector(), waitForLoadState(), waitForResponse()',
    'ELEMENT STATE: Verify element is visible AND enabled before interaction - use locator.isVisible() and isEnabled()',
    'LOADING STATES: Use page.waitForLoadState("networkidle") for SPAs, "domcontentloaded" for static pages',
    'PRE-INTERACTION: Always verify element.isVisible() && element.isEnabled() before click/fill/select actions',
    'PAGE LOADS: Always verify navigation success with page.waitForURL() or check for expected page elements',
    'BROWSER CONTEXT: Use page.goto() instead of manipulating window.location for better reliability',
    'REDIRECTS: Handle expected redirects by waiting for final URL or expected page content',
    'Always define specific wait conditions rather than arbitrary delays'
] as const;

export const SERVICE_BASE_RULES: Record<TServiceType, readonly string[]> = {
    [SERVICE.CREATE]: [
        ...GENERATE_RULES,
        'SCOPE: Generate complete, production-ready code following all project patterns and conventions',
        'STRUCTURE: Create proper class hierarchies, method organization, and clear separation of concerns',
        'VALIDATION: Include input validation, error handling, and edge case coverage',
    ],
    [SERVICE.HEAL]: [
        ...UPDATE_RULES,
        'OBJECTIVE: Fix ONLY the immediate test failure - do not refactor or improve unrelated code',
        'ROOT CAUSE: Target the actual cause of failure, not symptoms - fix broken selectors, not just timeouts',
        'MINIMAL SCOPE: Modify only the failing code path - preserve all working functionality exactly as-is',
        'NO ENHANCEMENTS: Do not add new features, improve performance, or update coding styles',
    ],
    [SERVICE.IMPROVE]: [
        ...GENERATE_RULES,
        ...UPDATE_RULES,
        'SCOPE: Enhance code quality, performance, and maintainability while preserving functionality',
        'OPTIMIZATION: Focus on performance improvements, better error handling, and code organization',
        'COMPATIBILITY: Ensure all improvements maintain backward compatibility',
    ],
} as const;

export const SERVICE_MAP: Record<TServiceType, TAction[]> = {
    [SERVICE.CREATE]: [ACTION.GENERATE],
    [SERVICE.HEAL]: [ACTION.UPDATE],
    [SERVICE.IMPROVE]: [ACTION.GENERATE, ACTION.UPDATE],
} as const;

export const TARGET_RULES: Record<TAction, Record<TTargetType, readonly string[]>> = {
    [ACTION.GENERATE]: {
        [TARGET.API]: [
            'Create complete API client classes with proper error handling and response typing',
            'Include request/response interfaces and proper HTTP status code handling',
            'Implement retry logic and timeout handling for network requests',
        ],
        [TARGET.LOCATOR]: [
            ...LOCATOR_RULES,
            'CREATE REQUIREMENT: Generate reusable locator methods with descriptive names like getUsernameInput(), getSubmitButton()',
            'ORGANIZATION: Group related locators in logical classes (LoginLocators, DashboardLocators)',
            'RETURN TYPES: All locator methods must return Playwright Locator objects, never strings or ElementHandle',
        ],
        [TARGET.PAGE]: [
            ...PAGE_RULES,
            'PAGE METHODS: Create action methods (fillLoginForm, clickSubmitButton) and verification methods (isLoggedIn, hasErrorMessage)',
            'WORKFLOW SUPPORT: Generate methods for complete business workflows, not just individual element interactions',
            'STATE VALIDATION: Include methods to verify page state and wait for page readiness before interactions',
            'CHAINING: Design methods to return Page object for fluent interface: page.login().navigateToDashboard()',
        ],
        [TARGET.TEST]: [
            ...TEST_RULES,
            'TEST STRUCTURE: Use clear arrange-act-assert pattern with descriptive test names explaining expected behavior',
            'SETUP/TEARDOWN: Include proper beforeEach/afterEach for test isolation and cleanup',
            'COVERAGE: Generate tests for positive scenarios, negative scenarios, edge cases, and error conditions',
        ],
    },
    [ACTION.UPDATE]: {
        [TARGET.API]: [
            'Preserve existing request/response interfaces unless they cause the specific failure',
            'Update only failing API calls - do not modify working endpoints',
        ],
        [TARGET.LOCATOR]: [
            ...LOCATOR_RULES,
            'LOCATOR UPDATES: When changing selectors, verify new locator targets the same logical element as before',
            'BREAKING CHANGES: Add recommendation if locator method name changes - warn about potential reference breaks in tests',
            'SELECTOR MIGRATION: When updating selectors, prefer moving up the priority hierarchy (CSS -> role -> testid)',
        ],
        [TARGET.PAGE]: [
            ...PAGE_RULES,
            'METHOD SIGNATURES: Preserve existing method signatures and return types unless they directly cause failures',
            'ABSTRACTION LEVELS: Maintain existing separation between low-level actions and high-level business methods',
            'BACKWARDS COMPATIBILITY: Ensure page method changes do not break existing test calls',
            'RECOVERY: Only add error recovery logic if the original test intended to handle specific failure scenarios',
        ],
        [TARGET.TEST]: [
            'TEST INTENT: Preserve original test purpose, coverage scope, and logical flow - only fix failing assertions/actions',
            'VERIFICATION POINTS: Maintain existing assertion structure unless assertions are factually incorrect',
            'TEST DATA: Update test data only if it causes the specific test failure being addressed',
        ],
    },
} as const satisfies Record<TAction, Record<TTargetType, readonly string[]>>;
