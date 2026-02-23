# TypeScript Rules

- Use named exports — default exports make refactoring harder.
- Avoid the `any` type — use `unknown` and narrow explicitly.
- Use `import type` for type-only imports.
- Prefer `const` — use `let` only when reassignment is necessary, never `var`.
- Write strongly typed code — no implicit `any`, strict mode on.
- Colocate tests with source files (`module.ts`, `module.test.ts`).
