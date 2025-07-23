import { ScrollArea, type ScrollAreaProps } from '@mantine/core';

import type { ReactNode } from 'preact/compat';

export const ResponsiveScrollArea = ({
  children,
  ...rest
}: { children: ReactNode } & ScrollAreaProps) => (
  <ScrollArea
    style={{
      height: 'calc(100dvh - var(--mantine-header-height, 0px) - 60px)'
    }}
    px="md"
    pb="lg"
    scrollbarSize={8}
    scrollbars="y"
    {...rest}
  >
    {children}
  </ScrollArea>
);
