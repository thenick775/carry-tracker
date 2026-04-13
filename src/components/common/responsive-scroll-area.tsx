import { ScrollArea, type ScrollAreaProps } from '@mantine/core';

export const ResponsiveScrollArea = ({
  children,
  ...rest
}: ScrollAreaProps) => (
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
    scrollbars="y"
    {...rest}
  >
    {children}
  </ScrollArea>
);
