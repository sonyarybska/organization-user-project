const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  {
    files: ['**/*.ts', '**/*.js'],
    ignores: ['node_modules/', 'dist/', 'migrations/'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      'max-len': [
        'error',
        {
          code: 130,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
          ignorePattern: '^\\s*import\\s.+\\sfrom\\s.+;$'
        }
      ],
      'max-lines': ['error', { max: 500, skipBlankLines: false }],
      'max-lines-per-function': [
        'error',
        {
          max: 800,
          skipBlankLines: true
        }
      ],
      'max-depth': ['error', 4],
      'dot-notation': 'error',
      'constructor-super': 'error',
      'no-param-reassign': ['error', { props: true }],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      quotes: ['error', 'single', { avoidEscape: false }],
      'object-curly-spacing': ['error', 'always'],
      curly: 'error',
      'no-async-promise-executor': ['error'],
      'no-console': 'error',
      semi: 'error',
      'comma-dangle': 'error',
      'object-shorthand': ['error', 'always'],

      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_'
        }
      ]
    }
  }
];
