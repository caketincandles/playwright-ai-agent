import * as Config from '@src/config';

/**
 * <suggested_prompt>
 * Using the conventions identified, generate:
 * - A new page object called SettingsPage
 * - A corresponding locator set for SettingsPage
 * - A test spec for verifying the ability to update user settings
 * # Ensure the structure and method conventions follow the BasePage inheritance and locator usage patterns.
 * </suggested_prompt>
 */

export const SUMMARY = `<main_objective>
Perform static analysis of the *base* or *abstract* classes used in:
* ${Object.values(Config.CONSTS.TARGET).join('S\n* ')}S
</main_objective><rules>
* Return only the XML structure. Do not include any prose, commentary, markdown or extra text
* The output must begin with <code_summary> and end with </code_summary>
* Each <category> block must describe the conventions, inheritance, usage, structure and purpose
* Include a <category> for each of: ${Object.values(Config.CONSTS.TARGET).join(', ')}
* If a category is not found, state so clearly in its fields (e.g. "No usage found in provided files")
* If additional base patterns (e.g., Actor base classes) exist, include them as custom <category> entries
</rules><example><input>
{
    fileName: 'base/BasePage.ts',
    content: \`export abstract class BasePage {
        constructor(protected readonly page: Page) {}

        protected async goto(url: string) {
            await this.page.goto(url);
        }
    }\`
}
</input><output><code_summary><category name="PAGE"><conventions>Base class for all pages. Abstract. Requires Playwright Page instance in constructor.</conventions><structure>Located in 'base/'. Contains shared navigation and utility methods.</structure><usage>Extended by concrete Page classes to inherit navigation.</usage><notes>Foundation for Page Object Model hierarchy.</notes></category><category name="LOCATOR"><conventions>Base locator structures or classes, if any, that define standard selector patterns or locator utilities.</conventions><structure>Typically abstract or shared locator constants or classes located in 'base/locators' or similar.</structure><usage>Extended or imported by feature-specific locator files to ensure consistency.</usage><notes>If none found, state "No locator base classes detected."</notes></category><category name="ACTOR"><conventions>Base actor classes representing user roles or personas, abstracting user interactions.</conventions><structure>Abstract classes or interfaces located in 'base/actors' or similar.</structure><usage>Extended by concrete actor implementations to encapsulate user behaviour in tests.</usage><notes>If none found, state "No actor base classes detected."</notes></category></code_summary></output></example>`;
