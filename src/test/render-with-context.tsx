import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import {
  render,
  act,
  cleanup,
  fireEvent,
  renderHook,
  screen,
  waitFor,
  within,
  type RenderOptions
} from '@testing-library/react';

import { cssVariableResolver } from '../theme/css-variable-resolver.ts';
import { shadcnTheme } from '../theme/mantine-hub-shadcn/theme.ts';

import type { ReactNode } from 'react';

type ProvidersProps = {
  children: ReactNode;
};

const Providers = ({ children }: ProvidersProps) => (
  <MantineProvider
    defaultColorScheme="dark"
    theme={shadcnTheme}
    cssVariablesResolver={cssVariableResolver}
    env="test"
  >
    <Notifications />
    {children}
  </MantineProvider>
);

export const renderWithContext = (ui: ReactNode, options?: RenderOptions) =>
  render(ui, {
    wrapper: ({ children }) => <Providers>{children}</Providers>,
    ...options
  });

export { act, cleanup, fireEvent, renderHook, screen, waitFor, within };
