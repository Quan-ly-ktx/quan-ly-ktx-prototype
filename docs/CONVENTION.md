# Code Conventions

This project uses React, TypeScript, Vite, and Tailwind CSS.

## General Rules

- Prefer functional React components.

- Use TypeScript for props, state, and shared data shapes.

- Keep code small, readable, and easy to scan.

- Follow the current folder structure in \[ARCHITECTURE.md\]

- Put each feature in the most specific folder that owns it.

## React Rules

- Keep components focused on one responsibility.

- Move reusable UI into `src/components/`.

- Keep page-level composition in `src/pages/`.

- Use `src/hooks/` for custom hooks.

- Use `src/contexts/` only for shared state that truly needs to cross multiple parts of the app.

- Put API and data access code in `src/services/`.

## TypeScript Rules

- Type component props explicitly.

- Prefer `type` for component props and local data shapes unless an `interface` is clearly better.

- Avoid `any` unless there is no practical alternative.

- Use narrow types and keep unions small and meaningful.

- Do not overuse type assertions; fix the data shape instead.

## Styling Rules

- Use Tailwind CSS v4 for layout and routine styling.

- Keep class lists readable and avoid unnecessary duplication.

- Extract reusable UI when a class list becomes hard to maintain.

- Keep global styles in `src/index.css` or `src/styles/` when needed.

## Naming Rules

- Use PascalCase for React components and component files.

- Use camelCase for variables, functions, hooks, and utilities.

- Name hooks with the `use` prefix.

- Use clear feature-oriented names instead of generic names like `data` or `stuff`.

## Accessibility Rules

- Use semantic HTML first.

- Add labels, alt text, and button types where needed.

- Make interactive elements keyboard accessible.

- Preserve focus states and visible hover states.

## Working Rules

- Check the nearest existing file before adding a new one.

- Prefer editing the file that owns the behavior instead of adding extra wrappers.

- Keep changes consistent with the current project structure.

- Validate code with `pnpm build`, `pnpm lint`, and `pnpm test`.