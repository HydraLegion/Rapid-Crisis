import { FlatCompat } from '@eslint/eslintrc'
import path from 'path'
import { fileURLToPath } from 'url'
import { globalIgnores } from 'eslint/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const compat = new FlatCompat({ baseDirectory: __dirname })

export default [
  // Ignore old Vite source, build output, and Next.js cache
  globalIgnores(['dist/**', 'src/**', '.next/**', 'node_modules/**']),

  // Next.js recommended — handles jsx-uses-vars, react/react-in-jsx-scope,
  // no-html-link-for-pages, and all core web vitals rules.
  // This is the canonical approach recommended by Vercel.
  ...compat.extends('next/core-web-vitals'),

  // Project-wide rule overrides
  {
    files: ['pages/**/*.{js,jsx}', 'components/**/*.{js,jsx}', 'store/**/*.{js,jsx}'],
    rules: {
      // Allow unused vars that start with _ (intentionally unused placeholders)
      'no-unused-vars': ['error', {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
        caughtErrors: 'none',    // don't flag empty catch blocks
      }],
      // Turn off react-hooks v7 strict rules that flag valid SSR / mount patterns
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      // Empty catch blocks are acceptable for SSR-guard try/catch
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
]
