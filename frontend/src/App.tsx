import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { UsersPage } from './pages/UsersPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UsersPage />
    </ThemeProvider>
  );
}

export default App;
