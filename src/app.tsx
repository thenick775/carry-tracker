import './app.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { MantineProvider } from '@mantine/core';

import { CarryTrackerAppShell } from './components/app-shell.tsx';
import { shadcnCssVariableResolver } from './theme/cssVariableResolver.ts';
import { shadcnTheme } from './theme/theme.ts';

export const App = () => (
  <MantineProvider
    defaultColorScheme="dark"
    theme={shadcnTheme}
    cssVariablesResolver={shadcnCssVariableResolver}
  >
    <CarryTrackerAppShell />
  </MantineProvider>
);
