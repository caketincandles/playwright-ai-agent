// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                project: true, // Enables project-specific TypeScript settings
            },
        },
        rules: {
            'prettier/prettier': ['warn', { endOfLine: 'auto' }], // Warn for Prettier issues
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/naming-convention': [
                'warn',
                // Classes: PascalCase
                {
                    selector: 'class',
                    format: ['PascalCase'],
                },
                // Functions: camelCase
                {
                    selector: 'function',
                    format: ['camelCase'],
                },
                // Types: TPascalCase
                {
                    selector: 'typeAlias',
                    format: ['PascalCase'],
                    custom: {
                        regex: '^T[A-Z]',
                        match: true,
                    },
                },
                // Interfaces: IPascalCase
                {
                    selector: 'interface',
                    format: ['PascalCase'],
                    custom: {
                        regex: '^I[A-Z]',
                        match: true,
                    },
                },
                // Interfaces and Types are just a personal preference...
                // I know it's retro, I like to know on import not hover
            ],

            complexity: ['warn', 8], // Limit Function Cyclomatic Complexity
            'max-params': ['error', 4], // Max of 4 parameters for functions
        },
        plugins: {
            prettier: eslintPluginPrettier, // Prettier plugin to enforce code style
        },
        settings: {
            prettier, // Prettier config for ESLint to use
        },
    },
);
