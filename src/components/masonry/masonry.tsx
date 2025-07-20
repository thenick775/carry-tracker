import { px, useMantineTheme } from '@mantine/core';
import ReactMasonry from 'react-masonry-css';

import classes from './masonry.module.css';

import type { ReactNode } from 'preact/compat';

export const Masonry = ({ children: items }: { children: ReactNode }) => {
  const theme = useMantineTheme();

  const breakpointCols = {
    default: 4,
    [px(theme.breakpoints.lg)]: 3,
    [px(theme.breakpoints.md)]: 2,
    [px(theme.breakpoints.sm)]: 1
  };

  return (
    <ReactMasonry
      breakpointCols={breakpointCols}
      className={classes['masonry-grid']}
      columnClassName={classes['masonry-grid_column']}
    >
      {items}
    </ReactMasonry>
  );
};
