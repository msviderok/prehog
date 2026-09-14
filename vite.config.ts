import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import { nitro } from 'nitro/vite'
import { defineConfig, loadEnv } from 'vite-plus'
import solidPlugin from 'vite-plugin-solid'
import { routeAssetsPlugin } from './assets.plugin.ts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    staged: {
      // '*': 'vp check --fix',
      '*': '',
    },
    lint: {
      plugins: ['import', 'typescript'],
      categories: {
        correctness: 'off',
      },
      env: {
        builtin: true,
        es2020: true,
        browser: true,
      },
      ignorePatterns: [
        '**/.nx/**',
        '**/.svelte-kit/**',
        '**/build/**',
        '**/coverage/**',
        '**/dist/**',
        '**/snap/**',
        '**/vite.config.*.timestamp-*.*',
      ],
      rules: {
        'for-direction': 'error',
        'no-async-promise-executor': 'error',
        'no-case-declarations': 'error',
        'no-class-assign': 'error',
        'no-compare-neg-zero': 'error',
        'no-cond-assign': 'error',
        'no-constant-binary-expression': 'error',
        'no-constant-condition': 'error',
        'no-control-regex': 'error',
        'no-debugger': 'error',
        'no-delete-var': 'error',
        'no-dupe-else-if': 'error',
        'no-duplicate-case': 'error',
        'no-empty-character-class': 'error',
        'no-empty-pattern': 'error',
        'no-empty-static-block': 'error',
        'no-ex-assign': 'error',
        'no-extra-boolean-cast': 'error',
        'no-fallthrough': 'error',
        'no-global-assign': 'error',
        'no-invalid-regexp': 'error',
        'no-irregular-whitespace': 'error',
        'no-loss-of-precision': 'error',
        'no-misleading-character-class': 'error',
        'no-nonoctal-decimal-escape': 'error',
        'no-regex-spaces': 'error',
        'no-self-assign': 'error',
        'no-shadow': 'warn',
        'no-shadow-restricted-names': 'error',
        'no-sparse-arrays': 'error',
        'no-unsafe-finally': 'error',
        'no-unsafe-optional-chaining': 'error',
        'no-unused-labels': 'error',
        'no-unused-private-class-members': 'error',
        'no-useless-backreference': 'error',
        'no-useless-catch': 'error',
        'no-useless-escape': 'error',
        'no-unassigned-vars': 'off',
        'no-var': 'error',
        'no-with': 'error',
        'no-unused-expressions': [
          'warn',
          {
            allowTernary: true,
          },
        ],
        'prefer-const': 'error',
        'require-yield': 'error',
        'use-isnan': 'error',
        'valid-typeof': 'error',
        'import/first': 'error',
        'import/no-commonjs': 'error',
        'import/no-duplicates': 'error',
        'typescript/array-type': 'off',
        'typescript/ban-ts-comment': [
          'error',
          {
            'ts-expect-error': false,
            'ts-ignore': 'allow-with-description',
          },
        ],
        'typescript/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
          },
        ],
        'typescript/no-duplicate-enum-values': 'error',
        'typescript/no-extra-non-null-assertion': 'error',
        'typescript/no-inferrable-types': [
          'error',
          {
            ignoreParameters: true,
          },
        ],
        'typescript/no-misused-new': 'error',
        'typescript/no-namespace': [
          'error',
          {
            allowDeclarations: true,
          },
        ],
        'typescript/no-non-null-asserted-optional-chain': 'error',
        'typescript/no-unsafe-function-type': 'error',
        'typescript/no-wrapper-object-types': 'error',
        'typescript/prefer-as-const': 'error',
        'typescript/prefer-for-of': 'warn',
        'typescript/triple-slash-reference': 'error',
        'vite-plus/prefer-vite-plus-imports': 'error',
      },
      options: {
        typeAware: true,
        typeCheck: true,
      },
      jsPlugins: [
        {
          name: 'vite-plus',
          specifier: 'vite-plus/oxlint-plugin',
        },
      ],
    },
    server: {
      port: 3000,
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [nitro(), tailwindcss(), tanstackStart(), solidPlugin({ ssr: true }), routeAssetsPlugin()],
    environments: {
      ssr: {
        define: {
          'process.env.CLERK_SECRET_KEY': JSON.stringify(env.CLERK_SECRET_KEY),
          'process.env.CLERK_JWT_ISSUER_DOMAIN': JSON.stringify(env.CLERK_JWT_ISSUER_DOMAIN),
          'process.env.VITE_CONVEX_URL': JSON.stringify(env.VITE_CONVEX_URL),
          'process.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY),
        },
      },
    },
  }
})
