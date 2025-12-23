import { ScrollArea, type ScrollAreaProps } from '@mantine/core';

import type { ReactNode } from 'react';

export const ResponsiveScrollArea = ({
  children,
  ...rest
}: { children: ReactNode } & ScrollAreaProps) => (
  <ScrollArea
    style={{
      height: 'calc(100dvh - var(--mantine-header-height, 0px) - 60px)'
    }}
    viewportProps={{
      style: {
        paddingTop: 'var(--mantine-spacing-md)'
      }
    }}
    px="md"
    scrollbarSize={8}
    scrollbars="y"
    {...rest}
  >
    {children}
  </ScrollArea>
);
