import path from 'path';
import * as Config from '@src/config';
import { BasePrompt } from '@src/llm/prompts/base';

export class Factory extends BasePrompt {
    constructor(
        protected readonly filePaths: string[],
        protected readonly service: Config.Types.TServiceType,
        protected readonly config: Config.Types.IConfig,
        protected readonly target: Config.Types.TTargetType[],
    ) {
        super(filePaths, service, config);
    }

    public async createPrompt(): Promise<string> {
        await this.ensureDataLoaded();

        const identity = this.getSingletonXml(this.identity, 'persona');
        const mainObj = this.getSingletonXml(
            this.main_objective,
            'main-objective',
        );
        const instructions = this.getArrayAsList(this.instructions);
        const rules = this.getArrayXml(this.rules, 'rule');
        const code = this.getCodeXml();

        const minifiedXml = this.minifyXml(`${identity}<task>${mainObj}${instructions}${rules}</task>`);

        return `<system-prompt>${minifiedXml}${code}</system-prompt>`;
    }

    private getCodeXml(): string {
        const tsFiles: string[] = [];

        for (const tsFile of this.code) {
            tsFiles.push(
                this.getSingletonXml(
                    this.minifyTypeScript(tsFile.content),
                    this.getCleanFileName(tsFile.fileName),
                ),
            );
        }

        const include: string[] = [];

        for (const inclusion of this.inclusions) {
            const includeByType: string[] = [];
            if (inclusion.paramSuffixes)
                includeByType.push(...inclusion.paramSuffixes);
            if (inclusion.classSuffixes)
                includeByType.push(...inclusion.classSuffixes);
            const taggedInclude = this.getArrayXml(
                includeByType,
                inclusion.target,
                false,
            );
            include.push(taggedInclude);
        }

        const inclusions =
            this.inclusions.length > 0
                ? this.getSingletonXml(this.getArrayAsList(include), 'naming-convention')
                : '';

        return this.getArrayXml([inclusions, ...tsFiles], 'code', false);
    }

    private getSingletonXml(item: string, tag: string): string {
        return `<${tag}>${item}</${tag}>`;
    }

    private getArrayXml(arr: string[], tag: string, plural = true): string {
        const members = arr
            .map((item) => this.getSingletonXml(item, tag))
            .join('');
        return plural ? `<${tag}s>${members}</${tag}s>` : members;
    }

    private getArrayAsList(arr: string[]): string {
        return '* ' + arr.join('\n* ');
    }

    private minifyTypeScript(code: string): string {
        return (
            code
                // Remove multi-line comments
                .replace(/\/\*[\s\S]*?\*\//g, '')
                // Remove extra whitespace
                .replace(/\s+/g, ' ')
                // Remove unnecessary semicolons and brackets spacing
                .replace(/\s*{\s*/g, '{')
                .replace(/\s*}\s*/g, '}')
                .replace(/\s*;\s*/g, ';')
                .trim()
        );
    }

    private minifyXml(xml: string): string {
    return (
        xml
            // Remove whitespace between tags
            .replace(/>\s+</g, '><')
            // Remove extra whitespace (but preserve single spaces in content)
            .replace(/\s+/g, ' ')
            // Remove spaces around tag brackets
            .replace(/\s*<\s*/g, '<')
            .replace(/\s*>\s*/g, '>')
            // Remove spaces around = in attributes
            .replace(/\s*=\s*/g, '=')
            // Remove spaces around quotes in attributes
            .replace(/=\s*"/g, '="')
            .replace(/"\s+/g, '" ')
            .trim()
    );
}

    private getCleanFileName(filePath: string): string {
        const parsed = path.parse(filePath);
        return parsed.name.replace(/_/g, '-');
    }
}
