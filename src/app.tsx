import './app.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

import { CarryTrackerAppShell } from './components/app-shell.tsx';
import { shadcnCssVariableResolver } from './theme/cssVariableResolver.ts';
import { shadcnTheme } from './theme/theme.ts';

dayjs.extend(isBetween);

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
