import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { LoggerService } from '../service';
import { MockLoggerService, mockLoggerManager } from './mock';
import { MockFileService } from '../../file/__tests__/mock';
import * as CONSTS from '../consts';
import * as Types from '../types';

describe('LoggerService', () => {
    let mockFileService: MockFileService;
    let loggerService: LoggerService;
    const testTag: Types.ILogTag = { service: CONSTS.SERVICE.DEV };

    beforeEach(() => {
        mockFileService = new MockFileService();
        loggerService = new LoggerService(testTag, {}, mockFileService);
    });

    describe('basic logging methods', () => {
        it('should log debug messages', () => {
            const spy = jest
                .spyOn(process.stdout, 'write')
                .mockImplementation(() => true);

            loggerService.debug('test debug message');

            expect(spy).toHaveBeenCalledWith(expect.stringContaining('DEBUG'));
            spy.mockRestore();
        });

        it('should log info messages with service tag', () => {
            const spy = jest
                .spyOn(process.stdout, 'write')
                .mockImplementation(() => true);

            loggerService.info('test info message');

            expect(spy).toHaveBeenCalledWith(
                expect.stringContaining('[Developer-Log]'),
            );
            spy.mockRestore();
        });

        it('should log success messages with emoji', () => {
            const spy = jest
                .spyOn(process.stdout, 'write')
                .mockImplementation(() => true);

            loggerService.success('operation completed');

            expect(spy).toHaveBeenCalledWith(expect.stringContaining('✅'));
            spy.mockRestore();
        });

        it('should log warnings with emoji', () => {
            const spy = jest
                .spyOn(process.stdout, 'write')
                .mockImplementation(() => true);

            loggerService.warn('test warning');

            expect(spy).toHaveBeenCalledWith(expect.stringContaining('⚠️'));
            spy.mockRestore();
        });
    });

    describe('error handling', () => {
        it('should exit process on error', () => {
            const exitSpy = jest
                .spyOn(process, 'exit')
                .mockImplementation(() => {
                    throw new Error('process.exit called');
                });
            const stderrSpy = jest
                .spyOn(process.stderr, 'write')
                .mockImplementation(() => true);

            expect(() => {
                loggerService.error('fatal error');
            }).toThrow('process.exit called');

            expect(exitSpy).toHaveBeenCalledWith(1);
            expect(stderrSpy).toHaveBeenCalledWith(
                expect.stringContaining('❌'),
            );

            exitSpy.mockRestore();
            stderrSpy.mockRestore();
        });

        it('should use custom exit code', () => {
            const exitSpy = jest
                .spyOn(process, 'exit')
                .mockImplementation(() => {
                    throw new Error('process.exit called');
                });
            jest.spyOn(process.stderr, 'write').mockImplementation(() => true);

            expect(() => {
                loggerService.error('custom error', undefined, 42);
            }).toThrow('process.exit called');

            expect(exitSpy).toHaveBeenCalledWith(42);

            exitSpy.mockRestore();
        });
    });

    describe('log level filtering', () => {
        it('should respect minimum log level', () => {
            const logger = new LoggerService(
                testTag,
                { minLevel: CONSTS.LOG_LEVEL.WARN },
                mockFileService,
            );
            const spy = jest
                .spyOn(process.stdout, 'write')
                .mockImplementation(() => true);

            logger.debug('should not appear');
            logger.info('should not appear');
            logger.warn('should appear');

            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(
                expect.stringContaining('should appear'),
            );

            spy.mockRestore();
        });
    });

    describe('timestamp configuration', () => {
        it('should include timestamp when configured', () => {
            const logger = new LoggerService(
                testTag,
                { showTimestamp: true },
                mockFileService,
            );
            const spy = jest
                .spyOn(process.stdout, 'write')
                .mockImplementation(() => true);

            logger.info('test message');

            expect(spy).toHaveBeenCalledWith(
                expect.stringMatching(
                    /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/,
                ),
            );

            spy.mockRestore();
        });
    });

    describe('recommendation logging', () => {
        it('should log recommendation with proper formatting', async () => {
            const spy = jest
                .spyOn(process.stdout, 'write')
                .mockImplementation(() => true);

            const recommendation: Types.IRecommendation = {
                type: 'Locators',
                severity: 'WARN',
                message: 'Locator could be improved',
                file: 'test.spec.ts',
                line: 42,
                suggestion: 'Use getByRole instead',
                autoFixable: true,
            };

            await loggerService.recommendation(recommendation);

            expect(spy).toHaveBeenCalledWith(expect.stringContaining('🔧'));
            expect(spy).toHaveBeenCalledWith(
                expect.stringContaining('[LOCATORS]'),
            );

            spy.mockRestore();
        });

        it('should handle non-auto-fixable recommendations', async () => {
            const spy = jest
                .spyOn(process.stdout, 'write')
                .mockImplementation(() => true);

            const recommendation: Types.IRecommendation = {
                type: 'Pages',
                severity: 'INFO',
                message: 'Consider refactoring',
                autoFixable: false,
            };

            await loggerService.recommendation(recommendation);

            expect(spy).toHaveBeenCalledWith(expect.stringContaining('💡'));

            spy.mockRestore();
        });
    });

    describe('heal result logging', () => {
        it('should log successful heal operation', async () => {
            const spy = jest
                .spyOn(process.stdout, 'write')
                .mockImplementation(() => true);

            const healResult: Types.IHealResult = {
                success: true,
                changes: [],
                filesModified: ['test1.ts', 'test2.ts'],
                timestamp: new Date().toISOString(),
            };

            await loggerService.healResult(healResult);

            expect(spy).toHaveBeenCalledWith(expect.stringContaining('✅'));
            expect(spy).toHaveBeenCalledWith(
                expect.stringContaining('Modified 2 files'),
            );

            spy.mockRestore();
        });

        it('should log unsuccessful heal operation', async () => {
            const spy = jest
                .spyOn(process.stdout, 'write')
                .mockImplementation(() => true);

            const healResult: Types.IHealResult = {
                success: false,
                changes: [
                    {
                        type: 'Locators',
                        severity: 'WARN',
                        message: 'Fix needed',
                    },
                ],
                timestamp: new Date().toISOString(),
            };

            await loggerService.healResult(healResult);

            expect(spy).toHaveBeenCalledWith(expect.stringContaining('⚠️'));
            expect(spy).toHaveBeenCalledWith(
                expect.stringContaining('Generated 1 recommendations'),
            );

            spy.mockRestore();
        });
    });

    describe('file output', () => {
        it('should write to configured output file', async () => {
            const outputFile = '/logs/test.log';
            loggerService.setOutputFile(outputFile);

            const recommendation: Types.IRecommendation = {
                type: 'API',
                severity: 'INFO',
                message: 'Test recommendation',
            };

            await loggerService.recommendation(recommendation);

            const logContent = await mockFileService.readFile(outputFile);
            const logEntry: Types.IRecommendation = JSON.parse(
                logContent.trim(),
            ) as Types.IRecommendation;

            expect(logEntry.type).toBe('recommendation');
            expect(logEntry.message).toBe('Test recommendation');
        });

        it('should handle file write errors gracefully', async () => {
            const originalAppendFile = mockFileService.appendFile;
            mockFileService.appendFile = jest
                .fn<(path: string, content: string) => Promise<void>>()
                .mockRejectedValue(new Error('Write failed'));

            const spy = jest
                .spyOn(process.stdout, 'write')
                .mockImplementation(() => true);
            loggerService.setOutputFile('/invalid/path.log');

            const recommendation: Types.IRecommendation = {
                type: 'API',
                severity: 'INFO',
                message: 'Test',
            };

            await expect(
                loggerService.recommendation(recommendation),
            ).resolves.not.toThrow();

            expect(spy).toHaveBeenCalledWith(
                expect.stringContaining('Failed to write to log file'),
            );

            mockFileService.appendFile = originalAppendFile;
            spy.mockRestore();
        });
    });

    describe('child logger creation', () => {
        it('should create child logger with combined tags', () => {
            const parentTag: Types.ILogTag = { service: CONSTS.SERVICE.CREATE };
            const parentLogger = new LoggerService(
                parentTag,
                {},
                mockFileService,
            );

            const childLogger = parentLogger.child({
                target: CONSTS.TARGET.LOCATOR,
            });

            expect(childLogger).toBeInstanceOf(LoggerService);
        });
    });

    describe('target tag formatting', () => {
        it('should include target in log output', () => {
            const tagWithTarget: Types.ILogTag = {
                service: CONSTS.SERVICE.HEAL,
                target: CONSTS.TARGET.PAGE,
            };
            const logger = new LoggerService(
                tagWithTarget,
                {},
                mockFileService,
            );
            const spy = jest
                .spyOn(process.stdout, 'write')
                .mockImplementation(() => true);

            logger.info('test with target');

            expect(spy).toHaveBeenCalledWith(
                expect.stringContaining('[_Pages_]'),
            );

            spy.mockRestore();
        });
    });
});

describe('MockLoggerService', () => {
    let mockLogger: MockLoggerService;
    const testTag: Types.ILogTag = { service: CONSTS.SERVICE.DEV };

    beforeEach(() => {
        mockLogger = new MockLoggerService(testTag);
        mockLogger.clearMessages();
    });

    describe('message capture', () => {
        it('should capture debug messages', () => {
            mockLogger.debug('debug message', { data: 'test' });

            expect(
                mockLogger.hasMessage('debug message', CONSTS.LOG_LEVEL.DEBUG),
            ).toBe(true);
            expect(mockLogger.getMessageCount(CONSTS.LOG_LEVEL.DEBUG)).toBe(1);
        });

        it('should capture messages with details', () => {
            const details = { important: 'data' };
            mockLogger.info('info with details', details);

            const messages = mockLogger.getCapturedMessages();
            expect(messages).toHaveLength(1);
            expect(messages[0].details).toEqual(details);
        });

        it('should get last message', () => {
            mockLogger.info('first message');
            mockLogger.warn('last message');

            expect(mockLogger.getLastMessage()).toBe('last message');
        });

        it('should filter messages by level', () => {
            mockLogger.debug('debug');
            mockLogger.info('info');
            mockLogger.warn('warning');

            const warnings = mockLogger.getMessagesByLevel(
                CONSTS.LOG_LEVEL.WARN,
            );
            expect(warnings).toEqual(['warning']);
        });
    });

    describe('error handling', () => {
        it('should throw on error calls', () => {
            expect(() => {
                mockLogger.error('test error');
            }).toThrow('Mock Logger Error: test error');

            expect(
                mockLogger.hasMessage('test error', CONSTS.LOG_LEVEL.ERROR),
            ).toBe(true);
        });
    });

    describe('recommendation and heal result handling', () => {
        it('should handle recommendations', async () => {
            const recommendation: Types.IRecommendation = {
                type: 'Locators',
                severity: 'WARN',
                message: 'Test recommendation',
            };

            await mockLogger.recommendation(recommendation);

            expect(
                mockLogger.hasMessage('[RECOMMENDATION] Test recommendation'),
            ).toBe(true);
        });

        it('should handle heal results', async () => {
            const healResult: Types.IHealResult = {
                success: true,
                changes: [],
                timestamp: new Date().toISOString(),
            };

            await mockLogger.healResult(healResult);

            expect(
                mockLogger.hasMessage('[HEAL] Operation completed: true'),
            ).toBe(true);
        });
    });

    describe('child logger creation', () => {
        it('should create child with combined tags', () => {
            const child = mockLogger.child({ target: CONSTS.TARGET.API });

            expect(child).toBeInstanceOf(MockLoggerService);
        });
    });

    describe('utility methods', () => {
        beforeEach(() => {
            mockLogger.debug('debug msg');
            mockLogger.info('info msg');
            mockLogger.warn('warn msg');
        });

        it('should clear all messages', () => {
            expect(mockLogger.getMessageCount()).toBe(3);

            mockLogger.clearMessages();

            expect(mockLogger.getMessageCount()).toBe(0);
        });

        it('should get total message count', () => {
            expect(mockLogger.getMessageCount()).toBe(3);
        });

        it('should check message existence', () => {
            expect(mockLogger.hasMessage('info msg')).toBe(true);
            expect(mockLogger.hasMessage('nonexistent')).toBe(false);
        });
    });
});

describe('MockLoggerManager', () => {
    beforeEach(() => {
        mockLoggerManager.clearAllMessages();
    });

    it('should manage multiple logger instances', () => {
        const logger1 = mockLoggerManager.getLogger({
            service: CONSTS.SERVICE.HEAL,
        });
        const logger2 = mockLoggerManager.getLogger({
            service: CONSTS.SERVICE.CREATE,
        });

        logger1.info('heal message');
        logger2.info('create message');

        expect(mockLoggerManager.getTotalMessageCount()).toBe(2);
    });

    it('should reuse logger instances for same tag', () => {
        const tag = { service: CONSTS.SERVICE.DEV };
        const logger1 = mockLoggerManager.getLogger(tag);
        const logger2 = mockLoggerManager.getLogger(tag);

        expect(logger1).toBe(logger2);
    });

    it('should set global configuration', () => {
        const config: Partial<Types.ILoggerConfig> = {
            minLevel: CONSTS.LOG_LEVEL.ERROR,
            userFacing: true,
        };

        mockLoggerManager.setGlobalConfig(config);

        const logger = mockLoggerManager.getLogger({
            service: CONSTS.SERVICE.DEV,
        });
        logger.debug('should not appear');
        logger.info('should not appear');

        expect(logger.getMessageCount()).toBe(0);
    });

    it('should clear all messages across loggers', () => {
        const logger1 = mockLoggerManager.getLogger({
            service: CONSTS.SERVICE.HEAL,
        });
        const logger2 = mockLoggerManager.getLogger({
            service: CONSTS.SERVICE.CREATE,
        });

        logger1.info('message 1');
        logger2.info('message 2');

        expect(mockLoggerManager.getTotalMessageCount()).toBe(2);

        mockLoggerManager.clearAllMessages();

        expect(mockLoggerManager.getTotalMessageCount()).toBe(0);
    });
});
