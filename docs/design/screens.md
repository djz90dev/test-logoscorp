# Screens

## Pantalla Principal: UsersDashboard

### Estructura

```
┌─────────────────────────────────────────────────────────────┐
│ AppBar                                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Menu]  Zoho Contact Sync        [Sync Selected (3)]   │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Content                                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Description text here...                                │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ┌───┬──────────┬─────────────┬───────────┬──────┬───┐  │ │
│ │ │ ☐ │ Name     │ Email       │ Phone     │Company│ ⋮ │  │ │
│ │ ├───┼──────────┼─────────────┼───────────┼──────┼───┤  │ │
│ │ │ ☐ │ Leanne   │ Sincere@... │ 1770...   │Roman │ ✏️│  │ │
│ │ │   │ Graham   │             │           │      │ 🔗│  │ │
│ │ ├───┼──────────┼─────────────┼───────────┼──────┼───┤  │ │
│ │ │ ☐ │ Ervin    │ Shanna@...  │ 010692... │Deckow│ ⚠️│  │ │
│ │ │   │ Howell   │             │           │-Crist│   │  │ │
│ │ │   │ ⚠️ Invalid: username starts with "C"            │  │ │
│ │ ├───┼──────────┼─────────────┼───────────┼──────┼───┤  │ │
│ │ │ ...                                                        │ │
│ │ └───┴──────────┴─────────────┴───────────┴──────┴───┘  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Componentes

#### AppBar

| Prop | Valor |
|------|-------|
| position | fixed |
| color | primary |
| elevation | 4 |

**Contenido:**
- Izquierda: IconButton (menu) + Typography (título)
- Derecha: Button "Sincronizar Seleccionados" (disabled si no hay selección)

**Label:** "Zoho Contact Sync - Panel de Administración"

#### Description

- Typography variant="body2"
- Color: grey[600]
- Margen: 0 0 16px 0
- Texto: "Administra y sincroniza contactos con Zoho CRM. Selecciona usuarios válidos para sincronizar."

#### DataGrid/Table

| Prop | Valor |
|------|-------|
| stickyHeader | true |
| size | medium |

**Columnas:**

| # | Campo | Width | Visible |
|---|-------|-------|---------|
| 1 | Checkbox | 48px | Siempre |
| 2 | Name | flex | Siempre |
| 3 | Email | 200px | Siempre |
| 4 | Phone | 150px | ≥900px |
| 5 | Company Name | 150px | ≥900px |
| 6 | Estado | 100px | Siempre |
| 7 | Acciones | 80px | Siempre |

### Estados de Pantalla

#### Loading

```
┌─────────────────────────────────────────────────────────────┐
│ AppBar                                                       │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Skeleton line]                                          │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ [Skeleton row]                                           │ │
│ │ [Skeleton row]                                           │ │
│ │ [Skeleton row]                                           │ │
│ │ [Skeleton row]                                           │ │
│ │ [Skeleton row]                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

- 5 filas Skeleton con animación shimmer
- Height: 52px por fila

#### Empty

```
┌─────────────────────────────────────────────────────────────┐
│ AppBar                                                       │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │              [Icon: Inbox]                              │ │
│ │                                                         │ │
│ │         No se encontraron usuarios                      │ │
│ │   No hay contactos disponibles para sincronizar         │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

- Icon: Inbox (fontSize: 64px, color: grey[400])
- Title: variant="h6", color: grey[700]
- Subtitle: variant="body2", color: grey[500]

#### Error

```
┌─────────────────────────────────────────────────────────────┐
│ AppBar                                                       │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │              [Icon: ErrorOutline]                       │ │
│ │                                                         │ │
│ │         Error al cargar usuarios                        │ │
│ │   No se pudo conectar con el servidor                   │ │
│ │                                                         │ │
│ │              [Reintentar]                                │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

- Icon: ErrorOutline (fontSize: 64px, color: error.main)
- Title: variant="h6"
- Button: variant="outlined", color="error"

#### Success (post-sync)

- Snackbar bottom-left
- Alert severity="success"
- Texto: "X contactos sincronizados correctamente"
- Auto-hide: 5000ms

#### Syncing

- Button "Sincronizar Seleccionados" muestra CircularProgress
- Button deshabilitado durante sync
- Snackbar informativo: "Sincronizando contactos..."

## Dialog: EditContact

### Estructura

```
┌─────────────────────────────────────────────┐
│ Editar Contacto                          [X] │
├─────────────────────────────────────────────┤
│                                             │
│  Name                                       │
│  ┌─────────────────────────────────────────┐│
│  │ Leanne Graham                           ││
│  └─────────────────────────────────────────┘│
│                                             │
│  Email                                      │
│  ┌─────────────────────────────────────────┐│
│  │ Sincere@april.biz                       ││
│  └─────────────────────────────────────────┘│
│                                             │
│  Phone                                      │
│  ┌─────────────────────────────────────────┐│
│  │ 1770736803164                           ││
│  └─────────────────────────────────────────┘│
│                                             │
│  Website                                    │
│  ┌─────────────────────────────────────────┐│
│  │ https://hildegard.org                   ││
│  └─────────────────────────────────────────┘│
│                                             │
│  Company Name                               │
│  ┌─────────────────────────────────────────┐│
│  │ Romaguera-Crona                         ││
│  └─────────────────────────────────────────┘│
│                                             │
├─────────────────────────────────────────────┤
│                          [Cancelar] [Enviar] │
└─────────────────────────────────────────────┘
```

### Props

| Prop | Valor |
|------|-------|
| open | boolean |
| maxWidth | sm |
| fullWidth | false |
| scroll | paper |

### Actions

| Botón | Variant | Color | Label |
|-------|---------|-------|-------|
| Cancelar | text | default | "Cancelar" |
| Guardar y Enviar | contained | primary | "Guardar y Enviar a CRM" |

### Campos

| Campo | Tipo | Required | Validación |
|-------|------|----------|------------|
| Name | TextField | Si | minLength: 2 |
| Email | TextField | Si | isEmail |
| Phone | TextField | Si | pattern: /^\d+$/ |
| Website | TextField | No | isURL |
| Company Name | TextField | No | - |

## Dialog: BulkSyncResult

### Estructura

```
┌─────────────────────────────────────────────┐
│ Resultado de Sincronización              [X] │
├─────────────────────────────────────────────┤
│                                             │
│  [CircularProgress]                         │
│                                             │
│  Sincronizando contactos...                 │
│  3 de 10 procesados                         │
│                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ████████████░░░░░░░░░  30%                 │
│                                             │
└─────────────────────────────────────────────┘
```

### During Sync

- CircularProgress con determinate progress
- Contador: "X de Y procesados"
- Botón "Cancelar" deshabilitado

### Post Sync

```
┌─────────────────────────────────────────────┐
│ Resultado de Sincronización              [X] │
├─────────────────────────────────────────────┤
│                                             │
│  [Check Circle] Sincronización completada   │
│                                             │
│  Total: 10                                  │
│  Exitosos: 8                                │
│  Fallidos: 2                                │
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │ ✓ Leanne Graham - Sincronizado          ││
│  │ ✓ Ervin Howell - Sincronizado           ││
│  │ ✗ Clementine - Error simulado           ││
│  │ ...                                     ││
│  └─────────────────────────────────────────┘│
│                                             │
│                          [Cerrar]           │
└─────────────────────────────────────────────┘
```

- Icono success: CheckCircle, color success
- Lista scrollable con resultados individuales
- Success: IconButton success + text
- Error: IconButton error + text + tooltip con detalle
