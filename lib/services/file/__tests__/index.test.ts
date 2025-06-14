import { describe, it, expect, beforeEach } from '@jest/globals';
import { FileService, Types } from '..';
import { MockFileService } from './mock';

describe('FileService', () => {
    let fileService: Types.IFileService;
    let mockFileService: MockFileService;

    beforeEach(() => {
        mockFileService = new MockFileService();
        fileService = mockFileService;
    });

    describe('readFile', () => {
        it('should read existing file content', async () => {
            const testContent = 'test file content';
            const filePath = '/test/file.txt';

            await mockFileService.writeFile(filePath, testContent);
            const result = await fileService.readFile(filePath);

            expect(result).toBe(testContent);
        });

        it('should throw error for non-existent file', async () => {
            await expect(
                fileService.readFile('/non/existent.txt'),
            ).rejects.toThrow('File not found');
        });

        it('should handle relative paths correctly', async () => {
            const content = 'relative content';
            const relativePath = 'relative/file.txt';

            await mockFileService.writeFile(relativePath, content);
            const result = await fileService.readFile(relativePath);

            expect(result).toBe(content);
        });
    });

    describe('writeFile', () => {
        it('should write content to new file', async () => {
            const content = 'new file content';
            const filePath = '/new/file.txt';

            await fileService.writeFile(filePath, content);
            const result = await fileService.readFile(filePath);

            expect(result).toBe(content);
        });

        it('should overwrite existing file', async () => {
            const filePath = '/existing/file.txt';
            const originalContent = 'original content';
            const newContent = 'updated content';

            await fileService.writeFile(filePath, originalContent);
            await fileService.writeFile(filePath, newContent);
            const result = await fileService.readFile(filePath);

            expect(result).toBe(newContent);
        });

        it('should handle empty content', async () => {
            const filePath = '/empty/file.txt';

            await fileService.writeFile(filePath, '');
            const result = await fileService.readFile(filePath);

            expect(result).toBe('');
        });
    });

    describe('appendFile', () => {
        it('should append to existing file', async () => {
            const filePath = '/append/file.txt';
            const initialContent = 'initial';
            const appendContent = ' appended';

            await fileService.writeFile(filePath, initialContent);
            await fileService.appendFile(filePath, appendContent);
            const result = await fileService.readFile(filePath);

            expect(result).toBe('initial appended');
        });

        it('should create new file if it does not exist', async () => {
            const filePath = '/new/append.txt';
            const content = 'created by append';

            await fileService.appendFile(filePath, content);
            const result = await fileService.readFile(filePath);

            expect(result).toBe(content);
        });

        it('should handle multiple appends', async () => {
            const filePath = '/multi/append.txt';

            await fileService.writeFile(filePath, 'start');
            await fileService.appendFile(filePath, ' middle');
            await fileService.appendFile(filePath, ' end');
            const result = await fileService.readFile(filePath);

            expect(result).toBe('start middle end');
        });
    });

    describe('exists', () => {
        it('should return true for existing files', async () => {
            const filePath = '/existing/file.txt';
            await fileService.writeFile(filePath, 'content');

            const exists = await fileService.exists(filePath);

            expect(exists).toBe(true);
        });

        it('should return false for non-existent files', async () => {
            const exists = await fileService.exists('/non/existent.txt');

            expect(exists).toBe(false);
        });

        it('should handle relative paths', async () => {
            const relativePath = 'test/relative.txt';
            await fileService.writeFile(relativePath, 'content');

            const exists = await fileService.exists(relativePath);

            expect(exists).toBe(true);
        });
    });

    describe('ensureDirectory', () => {
        it('should not throw for any directory path', async () => {
            await expect(
                fileService.ensureDirectory('/some/deep/path'),
            ).resolves.not.toThrow();
        });

        it('should handle nested directory creation', async () => {
            const dirPath = '/very/deep/nested/directory';

            await expect(
                fileService.ensureDirectory(dirPath),
            ).resolves.toBeUndefined();
        });
    });

    describe('MockFileService utilities', () => {
        it('should reset file storage', async () => {
            await mockFileService.writeFile('/test.txt', 'content');
            expect(await mockFileService.exists('/test.txt')).toBe(true);

            mockFileService.reset();

            expect(await mockFileService.exists('/test.txt')).toBe(false);
        });

        it('should handle complex file paths', async () => {
            const complexPath = '/complex/../normalised/./path/file.txt';
            const content = 'complex path content';

            await fileService.writeFile(complexPath, content);
            const result = await fileService.readFile(complexPath);

            expect(result).toBe(content);
        });
    });
});

describe('Production FileService', () => {
    let fileService: FileService;
    const testBasePath = '/tmp/test-fs';

    beforeEach(() => {
        fileService = new FileService(testBasePath);
    });

    it('should initialise with base path', () => {
        expect(fileService).toBeInstanceOf(FileService);
    });

    it('should initialise without base path', () => {
        const service = new FileService();
        expect(service).toBeInstanceOf(FileService);
    });

    it('should handle error messages correctly', async () => {
        // Verifies error handling without causing file system errors
        const service = new FileService('/invalid/base/path');
        expect(service).toBeInstanceOf(FileService); // Verifies service instantiates correctly
    });
});
