# Copilot Coding Standards and Contribution Guide

Welcome to the YT Electron + React Project! This document outlines the coding practices and contribution standards that must be followed for all new features, bug fixes, and code changes. These standards ensure the project remains maintainable, modular, and easy for all contributors to understand and extend.

## General Coding Practices

- **Modularity:**
  - Break code into small, reusable modules and components.
  - Avoid large monolithic files; use helpers, services, and hooks as appropriate.

- **Maintainability:**
  - Write code that is easy to read, understand, and modify.
  - Use clear, descriptive variable and function names.
  - Avoid deep nesting and complex logic; refactor for clarity.

- **Documentation:**
  - Every function, class, and module must have JSDoc or equivalent comments describing its purpose, parameters, and return values.
  - All new features and significant changes must be documented in the `README.md`.
  - Update or add usage instructions, environment setup, and dependency notes as needed.

- **React Best Practices:**
  - Use functional components and React hooks.
  - Keep components focused; move logic to hooks or services when possible.
  - Use PropTypes or TypeScript for type safety.
  - Keep UI logic and business logic separate.
  - Use context for global state only when necessary.

- **Error Handling:**
  - Handle errors gracefully and provide meaningful feedback to users.
  - Log errors for debugging, but avoid leaking sensitive information.

- **Testing:**
  - Write unit tests for all new modules, helpers, and components.
  - Use integration tests for critical flows.

- **Code Style:**
  - Follow the existing code style (indentation, spacing, naming conventions).
  - Use Prettier and ESLint to enforce formatting and linting.
  - No unused variables, dead code, or commented-out blocks in production.

- **Version Control:**
  - Write clear, descriptive commit messages.
  - Group related changes in a single commit.
  - Reference issues or features in commit messages when relevant.

## Pull Request Checklist

- [ ] Code is modular, maintainable, and well-documented.
- [ ] All new/changed code is covered by tests.
- [ ] README.md is updated with new features, usage, or setup instructions.
- [ ] No lint or formatting errors.
- [ ] All CI checks pass.

## README Update Policy

- Any new feature, breaking change, or significant update **must** be reflected in the `README.md`.
- Include usage examples, configuration steps, and any new environment variables or dependencies.

## Copilot Instructions

- When using Copilot or any AI assistant:
  - Always generate code that follows the above standards.
  - Prefer modular, well-documented solutions.
  - If a new feature or refactor is requested, update the `README.md` accordingly.
  - Add or update JSDoc comments for all new/changed functions.
  - Suggest or add tests for new logic.
  - If unsure about a best practice, refer to this document or ask for clarification.

---

By following these standards, we ensure this project remains robust, easy to maintain, and welcoming to all contributors for years to come.

---

**For maintainers:**
- Review all pull requests for adherence to these standards.
- Reject or request changes for any PR that does not meet the requirements.
- Keep this document up to date as the project evolves.

## Copilot/AI Usage Instructions

- Whenever you use Copilot or any AI tool to generate code for this project:
  - Ensure all code is modular, maintainable, and well-documented.
  - Always update the README.md if you add a new feature, change usage, or add dependencies.
  - Add or update JSDoc comments for all new/changed functions, classes, and modules.
  - Prefer splitting logic into helpers, hooks, or services for React/Electron code.
  - Follow React best practices (functional components, hooks, PropTypes/TypeScript, separation of concerns).
  - Write or suggest tests for new logic.
  - If unsure about a best practice, refer to this document or ask for clarification.

---
