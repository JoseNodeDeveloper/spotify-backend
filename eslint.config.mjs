import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**'] },
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
      // The domain layer cannot depend on frameworks or on infrastructure.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/infrastructure/**', '**/presentation/**'], message: 'The domain and application layers do not depend on outer layers.' },
          ],
        },
      ],
    },
  },
  {
    // The domain is pure TypeScript: no NestJS, no TypeORM, no third-party libraries.
    files: ['src/**/domain/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@nestjs/*', 'typeorm', 'bcrypt', 'zod', 'express'], message: 'The domain does not depend on frameworks.' },
            { group: ['**/infrastructure/**', '**/presentation/**', '**/application/**'], message: 'The domain is the innermost layer.' },
          ],
        },
      ],
    },
  },
  {
    // Outer layers may import from each other and from the domain.
    files: ['src/**/infrastructure/**', 'src/**/presentation/**', 'src/**/*.module.ts', 'src/main.ts', 'test/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
);
