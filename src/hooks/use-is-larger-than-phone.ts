import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export const useIsLargerThanPhone = () => {
  const theme = useMantineTheme();

  const isLargerThanPhone = useMediaQuery(
    `(min-width: ${theme.breakpoints.sm})`
  );

  return isLargerThanPhone;
};
