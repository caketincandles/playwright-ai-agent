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
        const ACTIONS = RULE.SERVICE_ACTION_MAP[this.service];

        const TARGET: Config.Types.TTargetType[] =
            this.target.length > 0
                ? this.target
                : Object.values(Config.CONSTS.TARGET);
        const TARGET_RULES = this.getTargetRules(ACTIONS, TARGET);

        const RULESET: string[] = [
            ...RULE.BASE_RULES,
            ...RULE.SERVICE_RULES[this.service],
            ...TARGET_RULES,
        ];

        for (const ACTION of ACTIONS) {
            RULESET.push(...RULE.ACTION_RULES[ACTION]);
        }

        return RULESET;
    }

    private getTargetRules(
        actions: Types.TAction[],
        target: Config.Types.TTargetType[],
    ): string[] {
        const ret: string[] = [];
        for (const TARGET of target) {
            for (const ACTION of actions) {
                ret.push(...RULE.ACTION_TARGET_RULES[ACTION][TARGET]);
            }
            ret.push(...RULE.TARGET_RULES[TARGET]);
        }
        if (this.target.length > 0) {
            if (
                !this.target.includes(Config.CONSTS.TARGET.PAGE) &&
                this.target.includes(Config.CONSTS.TARGET.TEST)
            ) {
                ret.push(...RULE.TARGET_RULES[Config.CONSTS.TARGET.PAGE]);
            }
        }
        return ret;
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
