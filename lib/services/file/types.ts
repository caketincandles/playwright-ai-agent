/**
 * Generic file service interface
 */
export interface IFileService {
    readFile(filePath: string): Promise<string>;
    writeFile(filePath: string, content: string): Promise<void>;
    appendFile(filePath: string, content: string): Promise<void>;
    exists(filePath: string): Promise<boolean>;
    ensureDirectory(dirPath: string): Promise<void>;
}
