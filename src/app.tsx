import './app.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import { CarryTrackerAppShell } from './components/app-shell.tsx';
import { shadcnCssVariableResolver } from './theme/cssVariableResolver.ts';
import { shadcnTheme } from './theme/theme.ts';

export const App = () => (
  <MantineProvider
    defaultColorScheme="dark"
    theme={shadcnTheme}
    cssVariablesResolver={shadcnCssVariableResolver}
  >
    <Notifications />
    <CarryTrackerAppShell />
  </MantineProvider>
);
