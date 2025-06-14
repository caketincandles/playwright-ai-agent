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
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            'prettier/prettier': ['warn', { endOfLine: 'auto' }],
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/naming-convention': [
                'warn',
                {
                    selector: 'class',
                    format: ['PascalCase'],
                },
                {
                    selector: 'function',
                    format: ['camelCase'],
                },
                {
                    selector: 'typeAlias',
                    format: ['PascalCase'],
                    custom: {
                        regex: '^T[A-Z]',
                        match: true,
                    },
                },
                {
                    selector: 'interface',
                    format: ['PascalCase'],
                    custom: {
                        regex: '^I[A-Z]',
                        match: true,
                    },
                },
            ],
            complexity: ['warn', 8],
            'max-params': ['error', 4],
        },
        plugins: {
            prettier: eslintPluginPrettier,
        },
        settings: {
            prettier,
        },
    },
    {
        files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
        languageOptions: {
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        rules: {
            'prettier/prettier': ['warn', { endOfLine: 'auto' }],
            complexity: ['warn', 8],
            'max-params': ['error', 4],
        },
        plugins: {
            prettier: eslintPluginPrettier,
        },
    },
    {
        ignores: [
            'dist/**/*',
            'lib/**/*', 
            'node_modules/**/*',
            'data/**/*',
            '**/*.d.ts',
            'coverage/**/*',
            '*.config.*',
        ],
    },
);
