# Accessibility

## WCAG 2.1 Compliance

### Nivel AA Target

Todos los componentes deben cumplir WCAG 2.1 nivel AA.

---

## Labels & ARIA

### AppBar

| Elemento | aria-label |
|----------|------------|
| Menu button | "Open navigation menu" |
| Title | aria-label="Zoho Contact Sync" |
| Sync button | "Sincronizar X contactos seleccionados" |

### Table

| Elemento | Atributo |
|----------|----------|
| Table | role="grid", aria-label="Contactos" |
| Header cell | scope="col" |
| Select all checkbox | aria-label="Select all valid contacts" |
| Row checkbox | aria-label="Select {name}" |
| Edit button | aria-label="Edit {name}" |
| Sync button | aria-label="Sync {name} with Zoho" |

### Dialog

| Elemento | Atributo |
|----------|----------|
| Dialog | role="dialog", aria-labelledby="dialog-title" |
| Title | id="dialog-title" |
| Close button | aria-label="Close dialog" |
| Form fields | aria-describedby="{field}-helper" |

---

## Keyboard Navigation

### Tab Order

```
AppBar
  → Menu button
  → Sync button
Table
  → Select all checkbox
  → Row 1 checkbox
  → Row 1 Edit button
  → Row 1 Sync button
  → Row 2 checkbox
  → ...
Dialog (when open)
  → Close button
  → Field 1
  → Field 2
  → ...
  → Cancel button
  → Save button
```

### Keyboard Shortcuts

| Tecla | Acción |
|-------|--------|
| Tab | Mover焦点 al siguiente elemento |
| Shift+Tab | Mover焦点 al anterior |
| Enter | Activar botón/enlace聚焦 |
| Space | Toggle checkbox |
| Escape | Cerrar dialog |
| Arrow Down/Up | Navegar filas (cuando table tiene focus) |

### Focus Management

```typescript
// Al abrir dialog
useEffect(() => {
  if (open) {
    const firstInput = document.querySelector('#dialog-form input');
    firstInput?.focus();
  }
}, [open]);

// Al cerrar dialog
const handleClose = () => {
  onClose();
  // Return focus to trigger element
  triggerRef.current?.focus();
};
```

---

## Color & Contrast

### Texto

| Elemento | Foreground | Background | Ratio | WCAG |
|----------|------------|------------|-------|------|
| Body text | grey[900] | white | 15.4:1 | AAA |
| Secondary text | grey[600] | white | 5.7:1 | AA |
| Disabled text | grey[400] | white | 3.1:1 | Large text only |
| Error text | error.main | white | 5.9:1 | AA |
| Success text | success.main | white | 4.6:1 | AA |

### Interactive Elements

| Elemento | Estado | Color | Ratio |
|----------|--------|-------|-------|
| Button | Default | primary.main on white | 4.6:1 |
| Button | Hover | primary.dark on white | 7.1:1 |
| Button | Disabled | grey[300] on grey[100] | 2.8:1 |
| Link | Default | primary.main | 4.6:1 |
| Link | Focus | primary.dark + underline | 7.1:1 |

### Icons

| Icono | Color | Contexto |
|-------|-------|----------|
| Edit | grey[600] | Acción secundaria |
| Sync | primary.main | Acción primaria |
| Warning | warning.main | Estado inválido |
| Error | error.main | Estado error |
| Success | success.main | Estado éxito |

---

## Screen Reader

### Live Regions

```tsx
// Status updates
<div aria-live="polite" aria-atomic="true">
  {syncing && <Typography>Sincronizando contactos...</Typography>}
</div>

// Error announcements
<div role="alert">
  {error && <Typography color="error">{error.message}</Typography>}
</div>

// Success announcements
<div aria-live="assertive">
  {success && <Typography>Sync completed: {successCount} contacts</Typography>}
</div>
```

### Table Announcements

```tsx
// Row announcement
<TableRow aria-rowindex={index + 2} aria-selected={selected}>

// Column headers
<TableHead>
  <TableRow>
    <TableCell scope="col">Name</TableCell>
    <TableCell scope="col">Email</TableCell>
    ...
  </TableRow>
</TableHead>
```

### Dialog Announcements

```tsx
<Dialog
  role="dialog"
  aria-modal="true"
  aria-labelledby="edit-dialog-title"
>
  <DialogTitle id="edit-dialog-title">
    Editar Contacto
  </DialogTitle>
</Dialog>
```

---

## Reduced Motion

```typescript
// Global preference
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Apply to animations
const transitionDuration = prefersReducedMotion ? 0 : 300;

// Skeleton animation
<Skeleton
  animation={prefersReducedMotion ? false : 'pulse'}
/>
```

---

## Focus Visible

```typescript
// Global styles
const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid #1976D2',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid #1976D2',
            outlineOffset: '2px',
          },
        },
      },
    },
  },
});
```

---

## Responsive Accessibility

### Tablet (600-1199px)

- Columnas ocultas: Phone, Company
- Acciones en IconButton menú
- Touch targets ≥44px

### Mobile (<600px)

- Layout apilado
- FAB para acciones principales
- Swipe para acciones secundarias
- Bottom sheet para dialogs

---

## Checklist

### Semantics

- [ ] Todos los inputs tienen labels visibles
- [ ] Buttons tienen aria-label cuando no tienen texto
- [ ] Tables tienen aria-label
- [ ] Dialogs tienen role="dialog" y aria-labelledby
- [ ] Live regions para actualizaciones de estado

### Keyboard

- [ ] Tab order lógico
- [ ] Focus visible en todos los interactive elements
- [ ] Escape cierra dialogs
- [ ] Enter activa buttons
- [ ] Space toggle checkboxes

### Color

- [ ] Text contrast ≥4.5:1 (normal text)
- [ ] Text contrast ≥3:1 (large text)
- [ ] UI components contrast ≥3:1
- [ ] No color-only information

### Motion

- [ ] Respects prefers-reduced-motion
- [ ] Skeleton animation optional
- [ ] Transitions ≤300ms

### Screen Reader

- [ ] aria-labels descriptivos
- [ ] Live regions para status
- [ ] Table headers scope
- [ ] Dialog aria-modal
