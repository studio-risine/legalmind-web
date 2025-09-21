# Commit Conventions

This document outlines the commit message conventions used in this project, enforced by Commitlint with custom rules.

## Overview

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification with additional project-specific rules to ensure consistency and clarity across all commits.

## Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

## Commit Types

| Type       | Description                                                   | Example                                            |
| ---------- | ------------------------------------------------------------- | -------------------------------------------------- |
| `feat`     | A new feature                                                 | `feat(auth): add google oauth integration`         |
| `fix`      | A bug fix                                                     | `fix(ui): resolve button alignment issue`          |
| `docs`     | Documentation only changes                                    | `docs(api): update authentication endpoints`       |
| `style`    | Changes that do not affect the meaning of the code            | `style(ui): format component code`                 |
| `refactor` | A code change that neither fixes a bug nor adds a feature     | `refactor(db): optimize user queries`              |
| `perf`     | A code change that improves performance                       | `perf(api): optimize database queries`             |
| `test`     | Adding missing tests or correcting existing tests             | `test(auth): add login validation tests`           |
| `build`    | Changes that affect the build system or external dependencies | `build(deps): upgrade react to v18`                |
| `ci`       | Changes to our CI configuration files and scripts             | `ci(config): add automated testing`                |
| `chore`    | Other changes that don't modify src or test files             | `chore(config): update eslint rules`               |
| `revert`   | Reverts a previous commit                                     | `revert: feat(auth): add google oauth integration` |

## Commit Scopes

Scopes help identify which part of the codebase is affected by the change:

| Scope     | Description                | Example                                 |
| --------- | -------------------------- | --------------------------------------- |
| `setup`   | Initial project setup      | `feat(setup): add project structure`    |
| `config`  | Configuration files        | `chore(config): update biome rules`     |
| `deps`    | Dependencies               | `build(deps): upgrade next.js`          |
| `ui`      | User interface components  | `feat(ui): add login form component`    |
| `api`     | API/backend logic          | `fix(api): resolve authentication bug`  |
| `auth`    | Authentication system      | `feat(auth): implement password reset`  |
| `db`      | Database related changes   | `refactor(db): optimize queries`        |
| `docs`    | Documentation              | `docs(setup): add installation guide`   |
| `test`    | Testing                    | `test(api): add endpoint tests`         |
| `build`   | Build/compilation          | `build(ci): update deployment pipeline` |
| `ci`      | Continuous integration     | `ci(config): add automated testing`     |
| `release` | Release/version management | `chore(release): bump version to 1.2.0` |

## Rules and Constraints

### 1. Type Rules
- **Required**: Every commit must have a type
- **Case**: Must be lowercase
- **Empty**: Type cannot be empty

### 2. Scope Rules
- **Required**: Every commit must have a scope
- **Enum**: Must be one of the predefined scopes
- **Case**: Must be lowercase

### 3. Description Rules
- **Required**: Description cannot be empty
- **Case**: Must be lowercase (no sentence case, start case, pascal case, or upper case)
- **Punctuation**: No period at the end
- **Mood**: Use imperative mood ("add feature" not "added feature")
- **Length**: Keep it concise but descriptive

### 4. Body Rules (Optional)
- **Format**: Use proper line breaks
- **Content**: Explain what and why, not how
- **Length**: Wrap at 72 characters

### 5. Footer Rules (Optional)
- **Breaking Changes**: Use `BREAKING CHANGE:` prefix
- **Issues**: Reference issues with `Closes #123` or `Fixes #456`

## Examples

### Valid Commits

```bash
# Simple feature
feat(auth): add google oauth integration

# Bug fix with scope
fix(ui): resolve button alignment issue

# Documentation update
docs(api): update authentication endpoints

# Refactoring with body
refactor(db): optimize user queries

This change improves query performance by adding proper indexes
and optimizing the join operations.

# Breaking change
feat(api): redesign user authentication

BREAKING CHANGE: The authentication API has been completely redesigned.
Old authentication methods are no longer supported.

# Issue reference
fix(auth): resolve token expiration bug

Closes #123
```

### Invalid Commits

```bash
# ❌ Missing scope
feat: add new feature

# ❌ Invalid type
feature(auth): add oauth

# ❌ Invalid scope
feat(frontend): add component

# ❌ Wrong case
Feat(auth): Add OAuth Integration

# ❌ Sentence case
feat(auth): Add google oauth integration.

# ❌ Empty description
feat(auth):

# ❌ Period at end
feat(auth): add google oauth integration.
```

## Breaking Changes

When a commit introduces a breaking change, it must be indicated in the footer:

```bash
feat(api): redesign user authentication

BREAKING CHANGE: The authentication API has been completely redesigned.
Old authentication methods are no longer supported.
```

## Issue References

Reference issues in the footer to automatically close them:

```bash
fix(auth): resolve token expiration bug

Closes #123
Fixes #456
```

## Benefits

Following these conventions provides several benefits:

1. **Automated Changelog Generation**: Tools can automatically generate changelogs
2. **Semantic Versioning**: Automatic version bumping based on commit types
3. **Clear History**: Easy to understand what each commit does
4. **Consistent Communication**: Team members understand the impact of changes
5. **Automated Releases**: CI/CD can automatically create releases

## Tools Integration

This project uses several tools that work with these conventions:

- **Commitlint**: Validates commit messages
- **Husky**: Runs validation on commit
- **Conventional Changelog**: Generates changelogs
- **Semantic Release**: Automated versioning and releases

## Getting Help

If you're unsure about a commit message format:

1. Check this documentation
2. Look at recent commits in the repository
3. Use `git commit` without `-m` to open an editor with examples
4. Ask team members for guidance

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Semantic Versioning](https://semver.org/)
