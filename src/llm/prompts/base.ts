import FileService from '@lib/services/file';
import type * as Types from '@src/llm/prompts/types';
import * as CONSTS from '@src/llm/prompts/consts';
import * as Config from '@src/config';
import * as RULE from '@src/llm/prompts/core/rules';
import { INSTRUCTIONS, MAIN_OBJECTIVE } from 'src/llm/prompts/core/task';
import { IProjectLocatorConfig } from '@src/config/types';

export abstract class BasePrompt implements Types.IXmlSchema {
    private dataLoadPromise?: Promise<void>;
    private isLoaded = false;

    protected abstract target: Config.Types.TTargetType[];

    public readonly identity = CONSTS.IDENTITY;

    public rules: string[];
    public main_objective: string;
    public instructions: string[];
    public code: Types.ITargetFiles[] = [];
    public inclusions: Types.ISuffixes[] = [];

    constructor(
        protected readonly filePaths: string[],
        protected readonly service: Config.Types.TServiceType,
        protected readonly config: Config.Types.IConfig,
    ) {
        this.main_objective = MAIN_OBJECTIVE[this.service];
        this.instructions = INSTRUCTIONS[this.service];
        this.rules = this.getRules;
        this.inclusions = this.getInclusions;

        this.dataLoadPromise = this.loadData().then(() => {
            this.isLoaded = true;
        });
    }

    public setPromptValues(overrides: {
        mainObjective?: string;
        instructions?: string[];
    }): void {
        if (overrides.mainObjective !== undefined) {
            this.main_objective = overrides.mainObjective;
        }
        if (overrides.instructions !== undefined) {
            this.instructions = overrides.instructions;
        }
    }

    protected async ensureDataLoaded(): Promise<void> {
        if (this.dataLoadPromise) {
            await this.dataLoadPromise;
        }
    }

    private async loadData(): Promise<void> {
        for (const filePath of this.filePaths) {
            await this.loadDataFile(filePath);
        }
    }

    private async loadDataFile(filePath: string): Promise<void> {
        const fs = new FileService();
        const fileContents = await fs.readFile(filePath);

        this.code.push({
            fileName: filePath,
            content: fileContents,
        });
    }

    private get getInclusions(): Types.ISuffixes[] {
        const suffixRules: Types.ISuffixes[] = [];
        for (const target of this.target) {
            suffixRules.push(this.getSuffixes(target));
        }
        return suffixRules;
    }

    private get getRules(): string[] {
        const RULESET: string[] = [];
        RULESET.push(...RULE.SERVICE_BASE_RULES[this.service]);

        const actions = RULE.SERVICE_MAP[this.service];

        if (this.target.length > 0) {
            for (const target of this.target) {
                for (const action of actions) {
                    RULESET.push(...RULE.TARGET_RULES[action][target]);
                }
            }

            if (
                !this.target.includes(Config.CONSTS.TARGET.PAGE) &&
                this.target.includes(Config.CONSTS.TARGET.TEST)
            ) {
                RULESET.push(...RULE.PAGE_RULES);
            }
        } else {
            for (const target in Config.CONSTS.TARGET) {
                for (const action of actions) {
                    RULESET.push(
                        ...RULE.TARGET_RULES[action][
                            target as Config.Types.TTargetType
                        ],
                    );
                }
            }
        }

        return RULESET;
    }

    private getSuffixes(target: Config.Types.TTargetType): Types.ISuffixes {
        if (
            target !== Config.CONSTS.TARGET.LOCATOR &&
            target !== Config.CONSTS.TARGET.PAGE
        ) {
            return { target };
        }
        let inc: IProjectLocatorConfig = this.config.pages;
        if (target === Config.CONSTS.TARGET.LOCATOR) inc = this.config.locators;
        const classSuffixes = inc.classSuffixes
            ? [
                  `Naming Convention for ${target} Classes: ${inc.classSuffixes.join(',')}`,
              ]
            : undefined;
        const paramSuffixes = inc.paramSuffixes
            ? [
                  `Naming Convention for ${target} Variables: ${inc.paramSuffixes.join(', ')}`,
              ]
            : undefined;

        return {
            target,
            classSuffixes,
            paramSuffixes,
        };
    }
}
