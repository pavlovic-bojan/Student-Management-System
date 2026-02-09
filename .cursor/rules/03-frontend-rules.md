# Frontend Rules

> **⚠️ CRITICAL**: Always apply **100% best practices** - see [01-development-workflow.md](./01-development-workflow.md)

## Frontend Rules

- Vue 3 Composition API (prefer `<script setup>`)
- Quasar Framework for UI components
- Tailwind CSS for custom styling
- TypeScript strict mode
- i18n support: English (en), Serbian Latin (sr-lat), Serbian Cyrillic (sr-cyr)
- **NEVER hardcode user-facing text** - always use i18n translations
- **ALWAYS add translations** for new features or changes in all three languages (en, sr-lat, sr-cyr)
- Use composables for reusable logic
- API calls through centralized API layer (`src/api/`)
- Error handling: Use `useApi` composable and error handler utilities
- Always use `npx quasar dev` instead of `quasar dev` (npm workspaces compatibility)
- **Write tests IMMEDIATELY**: Unit tests for composables/utils, Component tests for Vue components (see [04-testing-rules.md](./04-testing-rules.md))

## Frontend Structure

```
frontend/
├── src/
│   ├── __tests__/      # All tests (components, composables, utils, etc.)
│   ├── api/            # API service layer
│   ├── boot/           # Quasar boot configuration
│   ├── components/     # Reusable components
│   │   └── common/     # Common/shared components
│   ├── composables/    # Vue composables
│   ├── css/            # Vue css
│   ├── layouts/        # Vue layouts configuration
│   ├── locales/        # i18n translation files
│   ├── pages/          # Page components (route components)
│   ├── router/         # Vue Router configuration
│   ├── styles/         # Vue styles
│   ├── stores/         # Vue Stores
│   ├── types/          # Vue types
│   └── utils/          # Vue utils
└── public/             # Static assets
```

## Frontend Environment Variables

**Local Development** (`.env` - not committed):
- Required: `VITE_API_URL`
- Optional: `VITE_ROUTER_MODE`, `VITE_ROUTER_BASE`
- These are loaded from `.env` file at build/runtime

**Template** (`.env.example` - committed to git):
- Must include all variables with example values
- Example: `VITE_API_URL=http://localhost:4000`
- Include comments explaining what each variable does

See [00-project-overview.md](./00-project-overview.md) for general environment variable rules.

## API Usage

**Global `$api`** configured in `src/boot/axios.ts`:

```typescript
// src/boot/axios.ts (Quasar boot file)
import { boot } from 'quasar/wrappers';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000'
});

export default boot(({ app }) => {
  app.config.globalProperties.$api = api;
  app.provide('api', api);
});

## Usage examples

const { data } = await $api.get('/tickets');
const { data } = await api.post('/auth/login', credentials);
```
## Frontend Component Rules

### Vue Components

- Use Composition API with `<script setup>`
- Extract reusable logic to composables
- Use TypeScript for props and emits
- Keep components focused and single-purpose
- Use Quasar components when possible, custom components for specific needs

### E2E Testing Attributes (MANDATORY)

**⚠️ CRITICAL: All interactive UI elements MUST have `data-test` attributes for E2E testing.**

#### When to Add `data-test` Attributes

- **MANDATORY**: Every new UI element that users can interact with MUST have a `data-test` attribute
- **MANDATORY**: When updating existing components, ensure all new or modified interactive elements have `data-test` attributes
- **MANDATORY**: If an existing element is missing `data-test`, add it immediately

#### Required `data-test` Attributes

1. **All form inputs** (`q-input`, `q-select`, `q-textarea`, etc.):
   - Format: `data-test="input-{field-name}"` or `data-test="select-{field-name}"`
   - Example: `data-test="input-email"`, `data-test="select-category"`, `data-test="input-filter-search"`

2. **All buttons** (`q-btn`):
   - Format: `data-test="button-{action-name}"`
   - Example: `data-test="button-submit"`, `data-test="button-cancel"`, `data-test="button-delete"`, `data-test="button-view-details"`

3. **All cards and containers** (`q-card`, `q-list`, etc.):
   - Format: `data-test="card-{name}"` or `data-test="{name}-list"`
   - Example: `data-test="card-profile-info"`, `data-test="notifications-list"`, `data-test="card-service-filters"`

4. **All forms** (`q-form`):
   - Format: `data-test="form-{name}"`
   - Example: `data-test="form-profile"`, `data-test="form-login"`

5. **All tabs** (`q-tab`):
   - Format: `data-test="tab-{name}"`
   - Example: `data-test="tab-personal-info"`, `data-test="tab-change-password"`

6. **Dynamic elements** (items in lists, cards with IDs):
   - Format: `:data-test="\`{type}-${id}\`"` or `data-test="{type}-{id}"`
   - Example: `:data-test="\`card-notification-${notification.id}\`"`, `:data-test="\`card-service-${service.id}\`"`

7. **Error and success messages**:
   - Format: `data-test="error-message"`, `data-test="success-message"`

8. **Empty states**:
   - Format: `data-test="empty-state"`

9. **Filters and search**:
   - Format: `data-test="filter-{name}"` or `data-test="input-filter-{name}"`
   - Example: `data-test="filter-all"`, `data-test="input-filter-search"`, `data-test="input-filter-min-price"`

10. **Common components**:
    - Footer: `data-test="app-footer"`, `data-test="footer-copyright"`
    - Dark mode toggle: `data-test="button-dark-mode-toggle"`
    - Language switcher: `data-test="button-language-switcher"`

#### Naming Conventions

- Use kebab-case for attribute values (e.g., `button-submit`, not `buttonSubmit`)
- Be descriptive but concise (e.g., `button-update-profile` not `button-update-user-profile-information`)
- Group related elements with consistent naming (e.g., all profile inputs: `input-profile-name`, `input-profile-email`, `input-profile-lastName`, `input-profile-address`)
- For dynamic content, use template literals: `:data-test="\`card-item-${item.id}\`"`

#### Examples

```vue
<!-- ✅ CORRECT: All elements have data-test attributes -->
<q-form data-test="form-profile" @submit="handleSubmit">
  <q-input
    data-test="input-profile-name"
    v-model="form.name"
    label="Name"
  />
  <q-input
    data-test="input-profile-lastName"
    v-model="form.lastName"
    label="Last Name"
  />
  <q-input
    data-test="input-profile-address"
    v-model="form.address"
    label="Address"
  />
  <q-btn
    data-test="button-update-profile"
    type="submit"
    label="Update Profile"
  />
</q-form>

<!-- ✅ CORRECT: Dynamic elements with template literals -->
<div
  v-for="notification in notifications"
  :key="notification.id"
  :data-test="`card-notification-${notification.id}`"
>
  <q-btn
    data-test="button-mark-read"
    @click="markAsRead(notification.id)"
  />
  <q-btn
    data-test="button-delete-notification"
    @click="deleteNotification(notification.id)"
  />
</div>

<!-- ❌ INCORRECT: Missing data-test attributes -->
<q-form @submit="handleSubmit">
  <q-input v-model="form.name" label="Name" />
  <q-input v-model="form.email" label="Email" />
  <q-btn type="submit" label="Submit" />
</q-form>
```

#### Validation Checklist

Before committing any frontend changes, verify:

- [ ] All new interactive elements have `data-test` attributes
- [ ] All updated interactive elements have `data-test` attributes
- [ ] All form inputs have `data-test` attributes
- [ ] All buttons have `data-test` attributes
- [ ] All cards/containers have `data-test` attributes
- [ ] Dynamic elements use template literals for `data-test`
- [ ] Naming follows kebab-case convention
- [ ] Related elements use consistent naming patterns

See [04-testing-rules.md](./04-testing-rules.md) for how E2E tests use these attributes.

### State Management

- Pinia for global state (auth, tickets, settings).
- Composables for local feature logic.
- Flow: Store → API → Composable → Component.

### Styling

- Use Quasar classes for layout and common styles
- Use Tailwind CSS for custom styling
- Follow mobile-first responsive design
- Ensure accessibility (WCAG 2.1 AA compliance)

## Internationalization (i18n)

### Translation Files

- Location: `frontend/src/locales/{locale}/`
- Structure: `common.json`, `errors.json`, `validation.json`, `pages/{page}.json`
- Always provide translations for all three languages: en, sr-lat, sr-cyr
- Use translation keys, never hardcode user-facing strings

### Translation Keys

- Format: `category.subcategory.key` (e.g., `pages.auth.login.title`)
- Keep keys descriptive and hierarchical
- Reuse common translations

### i18n Workflow

**When adding new features or updating existing ones:**
1. **For new features**: Add new translation keys to all three languages
2. **For updated features**: Update existing translation keys in all three languages + add new keys if text changed
3. Add/update in `frontend/src/locales/en/` (English)
4. Add/update in `frontend/src/locales/sr-lat/` (Serbian Latin)
5. Add/update in `frontend/src/locales/sr-cyr/` (Serbian Cyrillic)
6. Use translation keys in components: `{{ t('pages.feature.title') }}`

## Error Handling

### Frontend Error Handling

- Use error boundaries for component errors
- Display user-friendly error messages
- Log errors to console in development
- Handle network errors gracefully

## Common Patterns

### Pinia Store Pattern

```typescript
// src/stores/useTicketsStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useTicketsStore = defineStore('tickets', () => {
  const tickets = ref([]);
  const loading = ref(false);

  const fetchTickets = async () => {
    loading.value = true;
    const { data } = await $api.get('/tickets');
    tickets.value = data;
    loading.value = false;
  };

  return { tickets, loading, fetchTickets };
});
```
### Vue Component Pattern

```vue
<template>
  <div>
    <!-- Component template -->
    <h1>{{ t('pages.feature.title') }}</h1>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'src/composables/useI18n';

const { t } = useI18n();
// Component logic
</script>
```

### Composable Pattern

```typescript
export function useFeature() {
  const data = ref(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchData = async () => {
    loading.value = true;
    error.value = null;
    try {
      data.value = await api.get('/feature');
    } catch (err) {
      error.value = err.message || 'An error occurred';
    } finally {
      loading.value = false;
    }
  };

  return { data, loading, error, fetchData };
}
```

### API Service Pattern

```typescript
// api/feature.api.ts
import { api } from 'src/boot/axios';

export const featureApi = {
  getAll: () => api.get('/api/features'),
  getById: (id: string) => api.get(`/api/features/${id}`),
  create: (data: CreateFeatureDto) => api.post('/api/features', data),
  update: (id: string, data: UpdateFeatureDto) => api.put(`/api/features/${id}`, data),
  delete: (id: string) => api.delete(`/api/features/${id}`),
};
```

---

**Related Rules**:
- [01-development-workflow.md](./01-development-workflow.md) - Development workflow
- [04-testing-rules.md](./04-testing-rules.md) - Testing rules for frontend
- [02-backend-rules.md](./02-backend-rules.md) - Backend API rules