import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/', 'node_modules/', '*.config.*'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
