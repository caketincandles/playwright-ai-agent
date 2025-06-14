import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.test.json',
            isolatedModules: true,
            useESM: false
        }
    },
    testEnvironment: 'node',
    rootDir: './',
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
        '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
        '<rootDir>/lib/**/__tests__/**/*.{ts,tsx}',
        '<rootDir>/lib/**/*.{test,spec}.{ts,tsx}'
    ],
    
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@app/(.*)$': '<rootDir>/app/$1'
    },
    
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            isolatedModules: true,
            diagnostics: false,
        }]
    },
    
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!lib/**/*.d.ts',
        '!src/**/__tests__/**',
        '!lib/**/__tests__/**'
    ],
    
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },
    
    coverageReporters: ['text', 'lcov', 'html'],
    coverageDirectory: 'coverage',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    clearMocks: true,
    restoreMocks: true,
    verbose: true,
    testTimeout: 10000,
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/build/',
        '/coverage/'
    ],
    moduleDirectories: ['node_modules', '<rootDir>'],
    errorOnDeprecated: true
};

export default config;
