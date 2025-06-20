import inquirer from 'inquirer';
import chalk from 'chalk';
import * as Types from '@app/setup/types';
import * as Validate from '@app/setup/validation';
import * as LlmTypes from '@src/llm/types';
import { PROVIDER_MODELS, PROVIDERS } from '@src/llm/consts';
import { toPascalCase } from '@lib/util/data-types/strings';
import { ILogger } from '@lib/services/logger/types';
import { BASE } from '@app/setup/consts';

export class SetupWizard {
    private defaultDir = 'src/pages';

    constructor(private readonly log: ILogger){}

    public async run(): Promise<Types.ISetupResponses> {
        this.log.info(chalk.cyan('🎭 Playwright AI Agent Setup\n'));
        
        const ai = await this.getAiConfig();
        const locators = await this.getLocatorsConfig();
        const pages = await this.getPagesConfig();
        
        return { ai, locators, pages };
    }
    
    private async getAiConfig(): Promise<Types.TAiSetupResponse> {
        this.log.info(chalk.cyanBright('✨ AI Setup\n'));
        const providerChoices = Object.entries(PROVIDERS).map(([key, value]) => ({
            name: toPascalCase(key),
            value: value
        }));

        const { provider } = await inquirer.prompt<{ provider: LlmTypes.TProvider }>([{
            type: 'list',
            name: 'provider',
            message: 'Choose AI provider:',
            choices: providerChoices
        }]);
        
        if (provider === PROVIDERS.LOCAL) {
            const { apiUrl } = await inquirer.prompt<{ apiUrl: string }>([{
                type: 'input',
                name: 'apiUrl',
                message: 'Enter your local API URL:',
                default: 'http://localhost:8080',
                validate: Validate.url,
            }]);
            return { provider, apiUrl } as Types.IAiInternalSetupResponse;
        }

        const modelChoices = Object.entries(PROVIDER_MODELS[provider]).map(([key, value]) => ({
            name: toPascalCase(key),
            value: value
        }));
        
        const { model, apiKey } = await inquirer.prompt<{ model: LlmTypes.TModelValue; apiKey: string }>([{
            type: 'list',
            name: 'model',
            message: 'Select model:',
            choices: modelChoices
        },
        {
            type: 'password',
            name: 'apiKey',
            message: 'API Key:',
            mask: '*',
            validate: Validate.apiKey,
        }]);
        
        return { provider, model, apiKey } as Types.IExternalAiSetupResponse;
    }

    private async showDefaultsAndAccept(
        defaultClassSuffixes: string[], defaultParamSuffixes?: string[]
    ): Promise<boolean> {
        this.log.info(`\nDefault class suffixes: ${chalk.gray.italic(defaultClassSuffixes.join(', '))}`);
        if(defaultParamSuffixes){
            this.log.info(`Default parameter suffixes: ${chalk.gray.italic(defaultParamSuffixes.join(', '))}`);
        }
        this.log.info(chalk.yellow('💡 Tip: Fewer suffixes = stricter patterns (recommended for linting)\n'));

        const { useDefaults } = await inquirer.prompt<{ useDefaults: boolean }>([{
            type: 'confirm',
            name: 'useDefaults',
            message: 'Use default suffixes?',
            default: true
        }]);

        return useDefaults;
    }

    private async captureCustomSuffix( 
        defaultSuffixes: readonly string[],
        type: string,
    ): Promise<string[]> {
        const message = 'Select suffixes for ' + type + ':';
        const addCustom = 'Add custom...';

        const { suffixes, customSfx } = await inquirer.prompt<{ 
            suffixes: string[], 
            customSfx?: string 
        }>([
            {
                type: 'checkbox',
                name: 'suffixes',
                message,
                choices: [...defaultSuffixes, addCustom],
                default: defaultSuffixes
            },
            {
                type: 'input',
                name: 'customSfx',
                message: 'Enter custom suffixes (comma-separated):',
                when: (answers) => Boolean(answers.suffixes?.includes(addCustom)),
            }
        ]);

        // Filter out 'Add custom...' and process custom suffixes
        const selectedSuffixes = suffixes.filter(s => s !== addCustom);
        const customSuffixes = customSfx 
            ? customSfx.split(',').map(s => s.trim()).filter(s => s.length > 0) 
            : [];
    
        // Use Set for deduplication validation, then convert back to array
        const allSuffixes = [...selectedSuffixes, ...customSuffixes];
        const uniqueSuffixes = Array.from(new Set(allSuffixes));
    
        return uniqueSuffixes;
    }
    
    private async getLocatorsConfig(): Promise<Types.IProjectSetup> {
        this.log.info(chalk.cyanBright('🔍 Locator Config\n'));
        const baseClassSfx = BASE.LOCATOR.CLASS_SUFFIXES;
        const baseParamSfx = BASE.LOCATOR.PARAM_SUFFIXES;

        const { locatorDir } = await inquirer.prompt<{ locatorDir: boolean }>([{
            type: 'confirm',
            name: 'locatorDir',
            message: 'Do you (intend to) use a dedicated locator folder?',
            default: true
        }]);

        const defaultDir = locatorDir ? 'src/locators' : this.defaultDir;

        const { directory } = await inquirer.prompt<{ directory: string }>([{
                type: 'input',
                name: 'directory',
                message: 'Locators directory:',
                default: defaultDir,
        }]);

        if (!locatorDir && directory !== this.defaultDir) this.defaultDir = directory;
    
        const useDefaults = await this.showDefaultsAndAccept(baseClassSfx, baseParamSfx);

        if (useDefaults) {
            return { 
                directory, 
                classSuffixes: baseClassSfx, 
                paramSuffixes: baseParamSfx 
            };
        }

        const classSuffixes = await this.captureCustomSuffix(baseClassSfx, 'classes');
        const paramSuffixes = await this.captureCustomSuffix(baseParamSfx, 'params');

        return { 
            directory, 
            classSuffixes, 
            paramSuffixes, 
        };
    }

    
    private async getPagesConfig(): Promise<Types.IBaseProjectSetup> {
        this.log.info(chalk.cyanBright('📄 Page Config\n'));
        const baseClassSfx = BASE.PAGE.CLASS_SUFFIXES;

        const { directory } = await inquirer.prompt<{ directory: string }>([{
            type: 'input',
            name: 'directory',
            message: 'Page directory:',
            default: this.defaultDir,
        }]);

        const useDefaults = await this.showDefaultsAndAccept(baseClassSfx);

        if (useDefaults) {
            return { 
                directory, 
                classSuffixes: baseClassSfx,
            };
        }

        const classSuffixes = await this.captureCustomSuffix(baseClassSfx, 'classes');

        return { 
            directory, 
            classSuffixes,
        };
    }
}
