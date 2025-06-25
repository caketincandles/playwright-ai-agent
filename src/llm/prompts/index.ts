import { BasePrompt } from '@src/llm/prompts/base';
import { TService } from '@src/llm/types';
import { TPlaywrightFile } from 'src/llm/prompts/types';

export class PromptFactory extends BasePrompt {
    public readonly rules: string[];

    constructor(
        protected readonly filePaths: string[], 
        protected readonly service: TService,
        protected readonly target: TPlaywrightFile,
    ) {
        super(filePaths, service);
        this.rules = this.serviceRules[this.target];
    }

    public async createPrompt(): Promise<string> {
        await this.ensureDataLoaded();
        
        const identity = this.getSingletonXml(this.identity, 'persona');
        const mainObj = this.getSingletonXml(this.main_objective, 'main-objective');
        const instructions = this.getArrayXml(this.instructions, 'instruction');
        const rules = this.getArrayXml(this.rules, 'rule');
        const code = this.getCodeXml();

        return `<system-prompt>${identity}<task>${mainObj}${instructions}${rules}</task>${code}</system-prompt>`;
    }

    private getCodeXml(): string {
        const { code } = this;
        const action = this.service.toLowerCase();
        const files = this.getArrayXml(code.content, `file-to-${action}`, false);
        
        const suffixes = [
            code.inclusions?.classSuffixes && `Naming Convention for ${this.target} Classes: ${code.inclusions.classSuffixes.join(',')}`,
            code.inclusions?.paramSuffixes && `Naming Convention for ${this.target} Variables: ${code.inclusions.paramSuffixes.join(', ')}`
        ].filter(Boolean) as string[];

        const inclusions = suffixes.length > 0 ? this.getArrayXml(suffixes, 'naming-convention', false) : '';

        return `<code>${files}${inclusions}</code>`;
    }

    private getSingletonXml(item: string, tag: string): string {
        return `<${tag}>${item}</${tag}>`;
    }

    private getArrayXml(arr: string[], tag: string, plural = true): string {
        const members = arr.map(item => this.getSingletonXml(item, tag)).join('');
        return plural ? `<${tag}s>${members}</${tag}s>` : members;
    }
}
