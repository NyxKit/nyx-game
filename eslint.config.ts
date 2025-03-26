import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVitest from '@vitest/eslint-plugin'
import pluginPlaywright from 'eslint-plugin-playwright'
import oxlint from 'eslint-plugin-oxlint'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}']
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/*.config.ts', '**/*.d.ts'],
  },

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },

  oxlint.configs['flat/recommended'],

  {
    rules: {
      // Enforce consistent code style
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/typedef': 'error',
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      'indent': ['error', 2, {
        flatTernaryExpressions: false,
        ignoredNodes: [],
        SwitchCase: 1,
        ArrayExpression: 1,
        ObjectExpression: 1,
        ImportDeclaration: 1,
        MemberExpression: 1
      }],
      'no-unexpected-multiline': 'error',
      'no-mixed-spaces-and-tabs': 'error',
      'no-tabs': 'error',
      'no-trailing-spaces': 'error',

      // Function style rules
      'func-style': ['error', 'expression'],
      'arrow-body-style': 'off',
      'prefer-arrow-callback': ['error', { allowNamedFunctions: false }],
      'arrow-parens': ['error', 'always'],
      'line-comment-position': 'off',
      'multiline-comment-style': 'off',

      // Enforce best practices
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        ignoreRestSiblings: true
      }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      'no-console': 'off',

      // Class organization
      '@typescript-eslint/member-ordering': ['error', {
        default: [
          // Index signature
          'signature',

          // Static fields
          'public-static-field',
          'protected-static-field',
          'private-static-field',

          // Fields
          'public-instance-field',
          'protected-instance-field',
          'private-instance-field',

          // Constructor
          'constructor',

          // Static methods
          'public-static-method',
          'protected-static-method',
          'private-static-method',

          // Methods
          'public-instance-method',
          'protected-instance-method',
          'private-instance-method',
        ]
      }]
    }
  }
)
