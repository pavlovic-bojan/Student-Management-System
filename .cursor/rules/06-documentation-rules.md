# Documentation Rules

> **⚠️ CRITICAL**: Always apply **100% best practices** - see [01-development-workflow.md](./01-development-workflow.md)

## Documentation Rules

### Code Comments

- Use JSDoc for functions and classes
- Explain "why" not "what" in comments
- Document complex algorithms or business logic
- Keep comments up-to-date with code changes

### JSDoc Example

```typescript
/**
 * Creates a new building with the provided data
 * @param data - Building creation data
 * @param prisma - Prisma client instance
 * @returns Created building with relations
 * @throws {ApiError} If building name already exists
 */
export async function createBuilding(
  data: CreateBuildingDto,
  prisma: PrismaClient
): Promise<Building> {
  // Implementation
}
```

## README Files

- Each workspace (backend, frontend, tests) should have its own README.md
- Root README.md should link to all sub-project READMEs
- Include setup instructions, API documentation links, and examples

## Project Documentation Structure

- **`project-doc/BRD.md`**: Business Requirements Document - always review before implementing new features
- **`project-doc/wireframe.png`**: Application wireframe - reference for UI/UX design
- **`learning/`**: Learning resources for developers:
  - `learning/backend.md`: Backend development guide
  - `learning/frontend.md`: Frontend development guide
  - `learning/qa.md`: QA testing guide
- **`LOCAL_SETUP.md`**: Local development setup guide
- **`CI-CD.md`**: CI/CD and deployment documentation
- **`analiza.md`**: Project analysis and implementation status

## User Documentation

- User manual in `user-manual/` folder with language subfolders (en, sr-lat, sr-cyr)
- All user-facing documentation must be translated to all three languages
- User manual is accessible in-app through the profile dropdown menu

### User Manual Structure

```
user-manual/
├── en/              # English documentation
├── sr-lat/          # Serbian Latin documentation
├── sr-cyr/          # Serbian Cyrillic documentation
└── images/          # Shared images
```

## API Documentation

- All API endpoints must be documented with Swagger/OpenAPI
- Use Swagger annotations in route files
- Keep API documentation up-to-date with code changes
- Include request/response examples

### Swagger Documentation Example

```typescript
/**
 * @swagger
 * /api/buildings:
 *   get:
 *     summary: Get all buildings
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of buildings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Building'
 */
router.get('/', authenticate, getBuildings);
```

## Documentation Updates Workflow

**When implementing new features or updating existing ones:**

1. **User Manual**: Update `user-manual/` folder in all three languages
2. **README Files**: Update relevant README.md files
3. **Setup Documentation**: Update `LOCAL_SETUP.md` if dependencies or setup changed
4. **Swagger Documentation**: Update API docs if API changed
5. **BRD.md**: Update if requirements changed
6. **Project Analysis**: Update `analiza.md` if major features added

See [01-development-workflow.md](./01-development-workflow.md) for detailed workflow.

---

**Related Rules**:
- [01-development-workflow.md](./01-development-workflow.md) - Documentation in workflow
- [02-backend-rules.md](./02-backend-rules.md) - API documentation
- [03-frontend-rules.md](./03-frontend-rules.md) - User documentation