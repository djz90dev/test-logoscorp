# Design System

## Tema Material Design

### Paleta de Colores

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976D2',      // Blue 700
      light: '#42A5F5',     // Blue 400
      dark: '#1565C0',      // Blue 800
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#9C27B0',      // Purple 500
      light: '#BA68C8',     // Purple 300
      dark: '#7B1FA2',      // Purple 700
    },
    error: {
      main: '#D32F2F',      // Red 700
      light: '#EF5350',     // Red 400
      dark: '#C62828',      // Red 800
    },
    success: {
      main: '#388E3C',      // Green 700
      light: '#66BB6A',     // Green 400
      dark: '#2E7D32',      // Green 800
    },
    warning: {
      main: '#F57C00',      // Orange 700
      light: '#FFA726',     // Orange 400
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
  },
});
```

### Tipografía

```typescript
theme.typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h6: {
    fontSize: '1.25rem',
    fontWeight: 500,
    letterSpacing: '0.01em',
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
  },
  body1: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.75rem',
    lineHeight: 1.5,
  },
  caption: {
    fontSize: '0.75rem',
    color: '#757575',
  },
};
```

### Espaciado

Sistema de 8px:

| Token | Valor | Uso |
|-------|-------|-----|
| spacing(0.5) | 4px | Inline spacing |
| spacing(1) | 8px | Elementos pequeños |
| spacing(1.5) | 12px | Padding interno |
| spacing(2) | 16px | Padding estándar |
| spacing(3) | 24px | Secciones |
| spacing(4) | 32px | Layout general |
| spacing(6) | 48px | Separación grande |

### Sombras

```typescript
shadows = [
  'none',                    // 0
  '0px 1px 3px rgba(0,0,0,0.12), 0px 1px 2px rgba(0,0,0,0.24)',  // 1
  '0px 3px 6px rgba(0,0,0,0.16), 0px 3px 6px rgba(0,0,0,0.23)',  // 2
  '0px 10px 20px rgba(0,0,0,0.19), 0px 6px 6px rgba(0,0,0,0.23)', // 3
  '0px 14px 28px rgba(0,0,0,0.25), 0px 10px 10px rgba(0,0,0,0.22)', // 4
  '0px 19px 38px rgba(0,0,0,0.30), 0px 15px 12px rgba(0,0,0,0.22)', // 5
];
```

### Componentes Base

#### AppBar

- Height: 64px
- Background: primary.main
- Elevation: 4
- Position: fixed

#### Table

- Header: grey[100] background
- Row height: 52px
- Divider: grey[300]
- Hover: primary.main opacity 0.04

#### Button

- Height: 36px
- Border-radius: 4px
- Font-weight: 500
- Text-transform: none

#### Dialog

- Max-width: 600px
- Border-radius: 8px
- Paper props: elevation 24

#### Snackbar

- Auto-hide: 5000ms
- Anchor: bottom-left
- Max-width: 400px

## Breakpoints

| Breakpoint | Width | Columns |
|------------|-------|---------|
| xs | 0-599px | 4 |
| sm | 600-899px | 8 |
| md | 900-1199px | 12 |
| lg | 1200-1535px | 12 |
| xl | 1536+ | 12 |

## Responsividad

### Desktop (≥1200px)

- Tabla con todas las columnas visibles
- Acciones inline
- Espaciado completo

### Tablet (600-1199px)

- Tabla con columnas reducidas
- Columnas: checkbox, Name, Email, Status, Actions
- Phone y Company ocultas
- Acciones en menú overflow

### Mobile (<600px)

- Layout apilado
- Cards por usuario
- Acciones en FAB
