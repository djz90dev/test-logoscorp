# Components

## UserTable

### Props

```typescript
interface UserTableProps {
  users: User[];
  selectedIds: number[];
  loading: boolean;
  onSelect: (ids: number[]) => void;
  onEdit: (user: User) => void;
  onSync: (user: User) => void;
}
```

### Estructura

```tsx
<TableContainer component={Paper}>
  <Table stickyHeader>
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={selected.length > 0 && selected.length < users.length}
            checked={users.length > 0 && selected.length === users.length}
          />
        </TableCell>
        <TableCell>Name</TableCell>
        <TableCell>Email</TableCell>
        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Phone</TableCell>
        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Company Name</TableCell>
        <TableCell>Estado</TableCell>
        <TableCell>Acciones</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {users.map((user) => (
        <UserRow key={user.id} user={user} />
      ))}
    </TableBody>
  </Table>
</TableContainer>
```

### Lógica

- **Select all**: Marca/desmarca todos los usuarios válidos
- **Disabled rows**: Usuarios inválidos no se pueden seleccionar
- **Loading**: Muestra Skeleton en cada celda

---

## UserRow

### Props

```typescript
interface UserRowProps {
  user: User;
  selected: boolean;
  onEdit: (user: User) => void;
  onSync: (user: User) => void;
}
```

### Template

```tsx
<TableRow
  hover
  sx={{
    opacity: user.isValidCompany ? 1 : 0.5,
    bgcolor: user.isValidCompany ? 'inherit' : 'grey.50',
  }}
>
  <TableCell padding="checkbox">
    <Checkbox
      checked={selected}
      disabled={!user.isValidCompany}
      inputProps={{ 'aria-label': `Select ${user.name}` }}
    />
  </TableCell>
  <TableCell>
    <Typography variant="body2" fontWeight={500}>
      {user.name}
    </Typography>
    {!user.isValidCompany && (
      <Typography variant="caption" color="error">
        ⚠ Invalid company
      </Typography>
    )}
  </TableCell>
  <TableCell>{user.email}</TableCell>
  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
    {user.normalizedPhone}
  </TableCell>
  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
    {user.company.name}
  </TableCell>
  <TableCell>
    <StatusChip isValid={user.isValidCompany} />
  </TableCell>
  <TableCell>
    <IconButton onClick={() => onEdit(user)} aria-label="Edit">
      <EditIcon />
    </IconButton>
    <IconButton
      onClick={() => onSync(user)}
      disabled={!user.isValidCompany}
      aria-label="Sync"
    >
      <SyncIcon />
    </IconButton>
  </TableCell>
</TableRow>
```

---

## StatusChip

### Props

```typescript
interface StatusChipProps {
  isValid: boolean;
  syncStatus?: 'pending' | 'syncing' | 'success' | 'error';
}
```

### Template

```tsx
<Chip
  label={getLabel()}
  color={getColor()}
  size="small"
  icon={getIcon()}
/>

// Logic:
// isValid=false → "Inválido", error, WarningIcon
// syncStatus=pending → "Pendiente", default, ScheduleIcon
// syncStatus=syncing → "Sincronizando", info, CircularProgress
// syncStatus=success → "Sincronizado", success, CheckCircleIcon
// syncStatus=error → "Error", error, ErrorIcon
```

---

## EditDialog

### Props

```typescript
interface EditDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
}
```

### Template

```tsx
<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
  <DialogTitle>
    Editar Contacto
    <IconButton onClick={onClose} aria-label="close" sx={{ position: 'absolute', right: 8, top: 8 }}>
      <CloseIcon />
    </IconButton>
  </DialogTitle>

  <DialogContent dividers>
    <form id="edit-form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField
          label="Name"
          value={formData.name}
          onChange={handleChange('name')}
          required
          fullWidth
          inputProps={{ 'aria-label': 'Name' }}
        />
        <TextField
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          required
          fullWidth
          inputProps={{ 'aria-label': 'Email' }}
        />
        <TextField
          label="Phone"
          value={formData.phone}
          onChange={handleChange('phone')}
          required
          fullWidth
          inputProps={{ 'aria-label': 'Phone' }}
          helperText="Solo dígitos"
        />
        <TextField
          label="Website"
          value={formData.website}
          onChange={handleChange('website')}
          fullWidth
          inputProps={{ 'aria-label': 'Website' }}
        />
        <TextField
          label="Company Name"
          value={formData.company.name}
          onChange={handleChange('company.name')}
          fullWidth
          inputProps={{ 'aria-label': 'Company Name' }}
        />
      </Stack>
    </form>
  </DialogContent>

  <DialogActions>
    <Button onClick={onClose}>Cancelar</Button>
    <Button type="submit" form="edit-form" variant="contained" color="primary">
      Guardar y Enviar a CRM
    </Button>
  </DialogActions>
</Dialog>
```

### Validación

| Campo | Regla | Error |
|-------|-------|-------|
| Name | required, minLength: 2 | "Name es requerido (mín. 2 caracteres)" |
| Email | required, email | "Email inválido" |
| Phone | required, pattern: /^\d+$/ | "Solo dígitos permitidos" |
| Website | isURL (optional) | "URL inválida" |

---

## BulkSyncDialog

### Props

```typescript
interface BulkSyncDialogProps {
  open: boolean;
  total: number;
  processed: number;
  results: SyncResult[];
  isRunning: boolean;
  onClose: () => void;
}
```

### Template

```tsx
<Dialog open={open} maxWidth="sm" fullWidth>
  <DialogTitle>Resultado de Sincronización</DialogTitle>

  <DialogContent dividers>
    {isRunning ? (
      <Stack alignItems="center" spacing={2}>
        <CircularProgress variant="determinate" value={(processed / total) * 100} />
        <Typography>Sincronizando contactos...</Typography>
        <Typography variant="body2">
          {processed} de {total} procesados
        </Typography>
      </Stack>
    ) : (
      <Stack spacing={2}>
        <Alert severity="success">
          Sincronización completada
        </Alert>

        <Stack direction="row" spacing={4}>
          <Box textAlign="center">
            <Typography variant="h4">{total}</Typography>
            <Typography variant="caption">Total</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h4" color="success.main">{results.filter(r => r.success).length}</Typography>
            <Typography variant="caption">Exitosos</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h4" color="error.main">{results.filter(r => !r.success).length}</Typography>
            <Typography variant="caption">Fallidos</Typography>
          </Box>
        </Stack>

        <Divider />

        <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
          {results.map((result) => (
            <ListItem key={result.userId}>
              <ListItemIcon>
                {result.success ? <CheckCircle color="success" /> : <Error color="error" />}
              </ListItemIcon>
              <ListItemText
                primary={result.userName}
                secondary={result.error?.message || 'Sincronizado'}
              />
            </ListItem>
          ))}
        </List>
      </Stack>
    )}
  </DialogContent>

  <DialogActions>
    <Button onClick={onClose} disabled={isRunning}>
      {isRunning ? 'Cancelar' : 'Cerrar'}
    </Button>
  </DialogActions>
</Dialog>
```

---

## FeedbackSnackbar

### Props

```typescript
interface FeedbackSnackbarProps {
  open: boolean;
  severity: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose: () => void;
}
```

### Template

```tsx
<Snackbar
  open={open}
  autoHideDuration={5000}
  onClose={onClose}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
>
  <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
    {message}
  </Alert>
</Snackbar>
```

---

## LoadingSkeleton

### Template

```tsx
<TableContainer>
  <Table>
    <TableBody>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell padding="checkbox">
            <Skeleton variant="rectangular" width={24} height={24} />
          </TableCell>
          <TableCell><Skeleton variant="text" width="60%" /></TableCell>
          <TableCell><Skeleton variant="text" width="80%" /></TableCell>
          <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
            <Skeleton variant="text" width="70%" />
          </TableCell>
          <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
            <Skeleton variant="text" width="50%" />
          </TableCell>
          <TableCell><Skeleton variant="rectangular" width={60} height={24} /></TableCell>
          <TableCell>
            <Skeleton variant="circular" width={32} height={32} />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
```

---

## EmptyState

### Props

```typescript
interface EmptyStateProps {
  title?: string;
  description?: string;
}
```

### Template

```tsx
<Box textAlign="center" py={8}>
  <InboxIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
  <Typography variant="h6" color="grey.700">
    {title || 'No se encontraron usuarios'}
  </Typography>
  <Typography variant="body2" color="grey.500">
    {description || 'No hay contactos disponibles para sincronizar'}
  </Typography>
</Box>
```

---

## ErrorState

### Props

```typescript
interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}
```

### Template

```tsx
<Box textAlign="center" py={8}>
  <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
  <Typography variant="h6" color="grey.700">
    Error al cargar usuarios
  </Typography>
  <Typography variant="body2" color="grey.500" mb={3}>
    {message || 'No se pudo conectar con el servidor'}
  </Typography>
  <Button variant="outlined" color="error" onClick={onRetry}>
    Reintentar
  </Button>
</Box>
```
