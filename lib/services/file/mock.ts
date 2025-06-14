import * as path from 'path';
import { IFileService } from './types';

export class MockFileService implements IFileService {
    private readonly files = new Map<string, string>();

    async readFile(filePath: string): Promise<string> {
        const content = this.files.get(path.resolve(filePath));
        if (content === undefined) {
            throw new Error(`File not found: ${filePath}`);
        }
        return content;
    }

    async writeFile(filePath: string, content: string): Promise<void> {
        this.files.set(path.resolve(filePath), content);
    }

    async appendFile(filePath: string, content: string): Promise<void> {
        const fullPath = path.resolve(filePath);
        const existing = this.files.get(fullPath) ?? '';
        this.files.set(fullPath, existing + content);
    }

    async exists(filePath: string): Promise<boolean> {
        return this.files.has(path.resolve(filePath));
    }

    async ensureDirectory(): Promise<void> {}

    reset(): void {
        this.files.clear();
    }
}
