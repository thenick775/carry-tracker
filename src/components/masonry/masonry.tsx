import { px, useMantineTheme } from '@mantine/core';
import ReactMasonry from 'react-masonry-css';

import classes from './masonry.module.css';

import type { ReactNode } from 'react';

export const Masonry = ({ children }: { children: ReactNode }) => {
  const theme = useMantineTheme();

  // compute breakpoint keys separately so react compiler can optimize
  const lgBreakpoint = px(theme.breakpoints.lg);
  const mdBreakpoint = px(theme.breakpoints.md);
  const smBreakpoint = px(theme.breakpoints.sm);

  const breakpointCols = {
    default: 4,
    [lgBreakpoint]: 3,
    [mdBreakpoint]: 2,
    [smBreakpoint]: 1
  };

  return (
    <ReactMasonry
      breakpointCols={breakpointCols}
      className={classes['masonry-grid']}
      columnClassName={classes['masonry-grid_column']}
    >
      {children}
    </ReactMasonry>
  );
};
