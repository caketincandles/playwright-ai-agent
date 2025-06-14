// jest.setup.ts
import { jest } from '@jest/globals';

beforeEach(() => {
    jest.clearAllMocks();
});

jest.setTimeout(10000);

process.env.NODE_ENV = 'test';

expect.extend({
    toBeValidLocator(received: string) {
        const locatorPatterns = [
            /page\.locator\(/,
            /page\.getByRole\(/,
            /page\.getByText\(/,
            /page\.getByTestId\(/
        ];
        
        const pass = locatorPatterns.some(pattern => pattern.test(received));
        
        return {
            message: () => `expected ${received} to be a valid Playwright locator`,
            pass,
        };
    },
});
