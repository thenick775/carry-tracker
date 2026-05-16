import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import {
  render as rtlRender,
  act,
  cleanup,
  fireEvent,
  renderHook,
  screen,
  waitFor,
  within,
  type RenderOptions as TestingLibraryRenderOptions
} from '@testing-library/react';

import { cssVariableResolver } from '../theme/css-variable-resolver.ts';
import { shadcnTheme } from '../theme/mantine-hub-shadcn/theme.ts';

import type { ReactNode } from 'react';

type RenderOptions = TestingLibraryRenderOptions & {
  withNotifications?: boolean;
};

type ProvidersProps = {
  children: ReactNode;
  withNotifications: boolean;
};

const Providers = ({ children, withNotifications }: ProvidersProps) => (
  <MantineProvider
    defaultColorScheme="dark"
    theme={shadcnTheme}
    cssVariablesResolver={cssVariableResolver}
  >
    {withNotifications ? <Notifications /> : null}
    {children}
  </MantineProvider>
);

export const renderWithContext = (
  ui: ReactNode,
  { withNotifications = false, ...options }: RenderOptions = {}
) =>
  rtlRender(ui, {
    wrapper: ({ children }) => (
      <Providers withNotifications={withNotifications}>{children}</Providers>
    ),
    ...options
  });

export { act, cleanup, fireEvent, renderHook, screen, waitFor, within };
