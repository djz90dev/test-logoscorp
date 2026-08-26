# Reporte Frontend

## Resumen

Frontend implementado con React + TypeScript + Vite + Material UI v9.

SPA con consumo de backend API. Sin comunicación directa con Zoho.

## Estructura

```
frontend/src/
├── components/
│   ├── UserTable.tsx          # Tabla con selección, skeleton, error, empty
│   ├── UserTable.test.tsx     # Tests de tabla
│   ├── EditUserDialog.tsx     # Modal de edición con validación
│   ├── EditUserDialog.test.tsx # Tests de edición
│   ├── BulkSyncDialog.tsx     # Modal de resultados bulk
│   ├── FeedbackSnackbar.tsx   # Snackbar para feedback
│   └── StatusChip.tsx         # Chip de estado
│   └── StatusChip.test.tsx    # Tests de chip
├── hooks/
│   ├── useUsers.ts            # Fetch de usuarios
│   ├── useSyncUser.ts         # Sync individual
│   └── useSyncBulk.ts         # Sync masiva
├── services/
│   └── api.ts                 # Capa HTTP (fetch)
├── pages/
│   └── UsersPage.tsx          # Página principal
├── types/
│   └── index.ts               # Tipos compartidos
├── theme/
│   └── index.ts               # Tema MUI
└── App.tsx                    # Root con ThemeProvider
```

## Componentes

| Componente | Props | Descripción |
|-----------|-------|-------------|
| UserTable | users, selectedIds, loading, error, onSelect, onEdit, onSync, onRetry | Tabla con checkboxes, skeleton loading, empty/error states |
| EditUserDialog | open, user, onClose, onSave | Dialog con formulario y validación client-side |
| BulkSyncDialog | open, syncing, result, error, onClose | Modal con progreso y resultados detallados |
| FeedbackSnackbar | open, severity, message, onClose | Snackbar para feedback al usuario |
| StatusChip | isValid, syncStatus | Chip que muestra estado de validación/sync |

## Hooks

| Hook | Retorna | Descripción |
|------|---------|-------------|
| useUsers | users, loading, error, refetch | GET /api/users |
| useSyncUser | syncing, feedback, handleSync, closeFeedback | POST /api/contacts/sync |
| useSyncBulk | syncing, result, error, handleBulkSync, closeDialog | POST /api/contacts/sync-bulk |

## API Layer

```typescript
api.ts
├── fetchUsers()        → GET /api/users
├── syncUser(user)      → POST /api/contacts/sync
└── syncBulk(users)     → POST /api/contacts/sync-bulk
```

Base URL configurable via `VITE_API_BASE_URL` (default: `http://localhost:3000`).

## Migración MUI v9

### System Props → sx

MUI v9 eliminó system props de Box, Stack, Typography.

```tsx
// Antes (v8)
<Box textAlign="center" py={8}>

// Después (v9)
<Box sx={{ textAlign: 'center', py: 8 }}>
```

### inputProps → slotProps

MUI v9 eliminó `inputProps` de TextField y Checkbox.

```tsx
// Antes (v8)
<TextField inputProps={{ 'aria-label': 'Name' }} />

// Después (v9)
<TextField slotProps={{ htmlInput: { 'aria-label': 'Name' } }} />

// Checkbox
<Checkbox slotProps={{ input: { 'aria-label': 'Select' } }} />
```

### Typography color

`color` ya no acepta strings arbitrarios en Typography.

```tsx
// Antes (v8)
<Typography color="grey.500">

// Después (v9)
<Typography sx={{ color: 'grey.500' }}>
```

## Tema

```typescript
theme/
├── palette: primary (blue), secondary (purple), error, warning, success
├── typography: Roboto, 400/500/700
├── shape: borderRadius 8
└── components: MuiButton borderRadius 8
```

## Feedback UX

| Componente | Uso |
|-----------|-----|
| Snackbar + Alert | Feedback de sync individual (éxito/error) |
| Dialog (BulkSyncDialog) | Progreso y resultados de sync masiva |
| CircularProgress | Indicador de carga en botones y bulk dialog |
| Skeleton | Loading state en tabla |
| StatusChip | Estado visual por usuario |
| Disabled state | Botones deshabilitados para usuarios inválidos |

## Accesibilidad

- `aria-label` en checkboxes, botones, tabla
- `role="dialog"` + `aria-modal="true"` en dialogs
- `aria-labelledby` en dialogs
- `aria-rowindex` en filas de tabla
- `aria-selected` en filas seleccionadas
- Focus management con MUI Dialog

## Responsive

- Tabla: columnas Phone/Company ocultas en `xs` (`display: { xs: 'none', md: 'table-cell' }`)
- Dialogs: `maxWidth="sm"` con `fullWidth`
- Container: `maxWidth="lg"`

## Tests

```
✓ UserTable.test.tsx (8 tests)
✓ EditUserDialog.test.tsx (6 tests)
✓ StatusChip.test.tsx (5 tests)

Total: 19 tests passing
```

### Cobertura

| Test | Tipo |
|------|------|
| Render users | Unit |
| Loading skeleton | Unit |
| Error state | Unit |
| Empty state | Unit |
| Checkbox disabled | Unit |
| Select/deselect | Unit |
| Edit button | Unit |
| Retry button | Unit |
| Dialog open/close | Unit |
| Cancel button | Unit |
| Required validation | Unit |
| Email validation | Unit |
| Phone validation | Unit |
| Status variants | Unit |

## Scripts

| Script | Comando |
|--------|---------|
| Dev | `npm run dev` |
| Build | `npm run build` |
| Test | `npm test` |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |

## Cumplimiento

| Requisito | Estado |
|-----------|--------|
| React + TS + Vite + MUI | ✓ |
| Consumo backend API | ✓ |
| Sin comunicación directa Zoho | ✓ |
| Material UI | ✓ |
| Sin alert() | ✓ Snackbar/Alert/Dialog |
| Skeleton loading | ✓ |
| CircularProgress | ✓ |
| Validación client-side | ✓ |
| Responsive | ✓ |
| Accesibilidad | ✓ aria-label, roles |
| Testing | ✓ 19 tests passing |
| MUI v9 compatible | ✓ Migrado |
