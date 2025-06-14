// jest.setup.ts
import { jest } from '@jest/globals';

beforeEach(() => {
    jest.clearAllMocks();
});

jest.setTimeout(10000);

process.env.NODE_ENV = 'test';
