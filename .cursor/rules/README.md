# Cursor AI Rules - Student Management System (SMS)

This directory contains the project rules for Cursor AI, organized into modular files for better maintainability and clarity.

## 📋 Rules Structure

The rules are organized into numbered files that should be read in order:

1. **[00-project-overview.md](./00-project-overview.md)** - Project overview, monorepo structure, code style, environment variables, Git conventions
2. **[01-development-workflow.md](./01-development-workflow.md)** - **MOST IMPORTANT** - Development workflow, order of implementation, testing workflow, code review checklist
3. **[02-backend-rules.md](./02-backend-rules.md)** - Backend-specific rules, API design, security, error handling, patterns
4. **[03-frontend-rules.md](./03-frontend-rules.md)** - Frontend-specific rules, Vue components, i18n, error handling, patterns
5. **[04-testing-rules.md](./04-testing-rules.md)** - Testing rules for all test types (unit, integration, E2E, API, DB, performance)
6. **[05-database-rules.md](./05-database-rules.md)** - Database rules, Prisma, migrations, performance
7. **[06-documentation-rules.md](./06-documentation-rules.md)** - Documentation rules, code comments, README files, API docs, user manual
8. **[07-deployment-rules.md](./07-deployment-rules.md)** - Deployment rules, CI/CD, Docker, performance

## 🚀 Quick Start

1. **Start with**: `project-doc/BRD.md` - Business Requirements Document (domains, epics, NFRs, architecture overview)
2. **Then read**: [01-development-workflow.md](./01-development-workflow.md) - This contains the **CRITICAL 100% Best Practices** rule and the complete development workflow
3. **Then read**: [00-project-overview.md](./00-project-overview.md) - Understand the monorepo structure and conventions
4. **Then read**: The specific rules for what you're working on (backend, frontend, testing, etc.)

## ⚠️ Critical Rules

### 100% Best Practices ALWAYS

**MANDATORY**: For EVERY task you work on - from analysis, planning, coding (backend, frontend), testing (all types), documentation, deployment - you MUST apply **100% best practices** at all times. This is non-negotiable.

See [01-development-workflow.md](./01-development-workflow.md) for details.

### E2E Tests MUST Use POM Pattern

**MANDATORY**: All E2E tests MUST ALWAYS use Page Object Model (POM) pattern. This is non-negotiable.

- **MUST** create Page Object classes in `tests/e2e/pages/`
- **MUST** use Page Objects in all E2E test files
- **NEVER** use direct `page.locator()` or `page.fill()` in test files

See [04-testing-rules.md](./04-testing-rules.md) for detailed POM requirements and examples.

### UI Elements MUST Have data-test Attributes

**MANDATORY**: All interactive UI elements MUST have `data-test` attributes for E2E testing. This is non-negotiable.

- **MUST** add `data-test` attributes to all new UI elements
- **MUST** add `data-test` attributes when updating existing UI elements
- **MUST** use kebab-case naming convention
- **MUST** use template literals for dynamic elements

See [03-frontend-rules.md](./03-frontend-rules.md) for detailed `data-test` requirements, naming conventions, and examples.

## 📖 How to Use These Rules

### When Starting a New Feature

1. Read [01-development-workflow.md](./01-development-workflow.md) - Follow the complete workflow
2. Read relevant specific rules:
   - Backend work? → [02-backend-rules.md](./02-backend-rules.md)
   - Frontend work? → [03-frontend-rules.md](./03-frontend-rules.md)
   - Testing? → [04-testing-rules.md](./04-testing-rules.md)
   - Database changes? → [05-database-rules.md](./05-database-rules.md)

### When Making Changes

1. Follow [01-development-workflow.md](./01-development-workflow.md) workflow
2. Check relevant rules for the area you're changing
3. Update documentation as needed (see [06-documentation-rules.md](./06-documentation-rules.md))

### When Reviewing Code

Use the Code Review Checklist in [01-development-workflow.md](./01-development-workflow.md).

## 🔗 Cross-References

All rule files contain cross-references to related rules. Follow the links to get complete context.

## 📝 Rule Updates

When updating rules:
1. Update the relevant rule file
2. Update cross-references if needed
3. Update this README if structure changes

---

**Last Updated**: 2026-02-09  
**Project**: Student Management System (SMS) SaaS