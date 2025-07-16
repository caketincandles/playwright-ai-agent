import * as Config from '@src/config';

const EXAMPLES: Record<Config.Types.TTargetType, string> = {
    [Config.CONSTS.TARGET.API]:
        `</category><category name="${Config.CONSTS.TARGET.API}"><conventions>No API usage found in provided files.</conventions><structure>N/A</structure><usage>N/A</usage><notes>May exist elsewhere in the codebase.</notes></category>`,
    [Config.CONSTS.TARGET.LOCATOR]:
        `<category name="${Config.CONSTS.TARGET.LOCATOR}"><conventions>Defined as const objects. Use data-testid attributes.</conventions><structure>One file per feature. Flat key-value structure.</structure><usage>Imported into page objects. Used in page.fill/click methods.</usage><notes>No dynamic generation. Typed with as const for safety.</notes></category>`,
    [Config.CONSTS.TARGET.PAGE]:
        `<category name="${Config.CONSTS.TARGET.PAGE}"><conventions>Each page extends BasePage. One class per file. Method names describe actions.</conventions><structure>Located under 'app/pages'. Constructor takes Playwright page fixture.</structure><usage>Instantiated in tests. Interact with locators directly.</usage><notes>Methods are procedural, one per action (e.g., login).</notes></category>`,
    [Config.CONSTS.TARGET.TEST]:
        `<category name="${Config.CONSTS.TARGET.TEST}"><conventions>Use Playwright test runner. Single test per file. Descriptive test names.</conventions><structure>Located under 'tests/'. Use Playwright fixtures.</structure><usage>Call methods on page objects. Use expect for assertions.</usage><notes>No custom fixtures or hooks detected.</notes></category>`,
};

const EXAMPLE: string = Object.values(Config.CONSTS.TARGET)
    .map((target) => EXAMPLES[target as Config.Types.TTargetType])
    .join('');

export const SUMMARY = `<main_objective>Perform static analysis of the *existing implemented* classes and files for:
* ${Object.values(Config.CONSTS.TARGET).join('s\n* ').toLowerCase()}s
</main_objective><rules>
* Return only the XML structure. Do not include any prose, commentary, markdown or extra text
* The output must begin with <code_summary> and end with </code_summary>
* Each <category> block must describe the conventions, inheritance, usage, structure and purpose
* Include a <category> for each of: ${Object.values(Config.CONSTS.TARGET).join(', ')}
* If a category is not found, state so clearly in its fields (e.g. "No usage found in provided files")
* If additional patterns (e.g., Actor implementations) exist, include them as custom <category> entries
</rules><example><input>
{
    fileName: 'app/pages/LoginPage.ts',
    content: \`import { LOGIN_LOCATORS } from '../locators/login';
    export class LoginPage extends BasePage {
        async login(username: string, password: string) {
            await this.page.fill(LOGIN_LOCATORS.USERNAME, username);
            await this.page.fill(LOGIN_LOCATORS.PASSWORD, password);
            await this.page.click(LOGIN_LOCATORS.SUBMIT);
        }
    }\`
},
{
    fileName: 'app/locators/login.ts',
    content: \`export const LOGIN_LOCATORS = {
        USERNAME: '[data-testid="username-input"]',
        PASSWORD: '[data-testid="password-input"]',
        SUBMIT: '[data-testid="submit-button"]',
    } as const;\`
},
{
    fileName: 'tests/login.spec.ts',
    content: \`import { test, expect } from '@playwright/test';
    import { LoginPage } from '../../app/pages/LoginPage';

    test('user can login', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login('admin', 'password');
        await expect(page).toHaveURL('/dashboard');
    });\`
}
</input><output><code_summary>${EXAMPLE}</code_summary></output></example>`;
