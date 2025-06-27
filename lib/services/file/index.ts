import * as fs from 'fs/promises';
import * as path from 'path';
import * as Types from '@lib/services/file/types';
import { devLog } from '@lib/services/logger';

export { Types };

export default class FileService implements Types.IFileService {
    constructor(private readonly basePath?: string) {}

    public async readFile(filePath: string): Promise<string> {
        const fullPath = this.resolvePath(filePath);
        try {
            return await fs.readFile(fullPath, 'utf-8');
        } catch (error) {
            const msg = `Failed to read file ${fullPath}: ${this.getErrorMessage(error)}`;
            devLog.error(msg);
            return msg;
        }
    }

    public async writeFile(filePath: string, content: string): Promise<void> {
        const fullPath = this.resolvePath(filePath);
        try {
            await this.ensureDirectory(path.dirname(fullPath));
            await fs.writeFile(fullPath, content, 'utf-8');
        } catch (error) {
            devLog.error(
                `Failed to write file ${fullPath}: ${this.getErrorMessage(error)}`,
            );
            devLog.debug(`Failed write to "${fullPath}"\n\n${content}\n`);
        }
    }

    public async appendFile(filePath: string, content: string): Promise<void> {
        const fullPath = this.resolvePath(filePath);
        try {
            await this.ensureDirectory(path.dirname(fullPath));
            await fs.appendFile(fullPath, content, 'utf-8');
        } catch (error) {
            devLog.error(
                `Failed to append file ${fullPath}: ${this.getErrorMessage(error)}`,
            );
            devLog.debug(`Failed to append file "${fullPath}"\n\n${content}\n`);
        }
    }

    public async exists(filePath: string): Promise<boolean> {
        try {
            await fs.access(this.resolvePath(filePath));
            return true;
        } catch {
            return false;
        }
    }

    public async ensureDirectory(dirPath: string): Promise<void> {
        try {
            await fs.mkdir(this.resolvePath(dirPath), { recursive: true });
        } catch (error) {
            devLog.error(
                `Failed to create directory ${dirPath}: ${this.getErrorMessage(error)}`,
            );
        }
    }

    private resolvePath(filePath: string): string {
        if (this.basePath && !path.isAbsolute(filePath)) {
            return path.resolve(this.basePath, filePath);
        }
        return path.resolve(filePath);
    }

    private getErrorMessage(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }
}
