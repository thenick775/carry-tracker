import {
  type CSSVariablesResolver,
  v8CssVariablesResolver
} from '@mantine/core';

import { shadcnCssVariableResolver } from './cssVariableResolver.ts';

/**
 * Composes v8CssVariablesResolver with shadcnCssVariableResolver.
 * Uses Mantine v9's v8CssVariablesResolver to preserve the v8 light variant behavior
 * (semi-transparent backgrounds) while keeping custom theme variables intact.
 * This solves the breaking change where Mantine v9 switched light variants to use
 * solid colors instead of transparency, making buttons invisible in dark mode.
 *
 * Note: [mantinehub](https://github.com/RubixCube-Innovations/mantine-theme-builder) does not yet
 * support Mantine v9, so we use this composition approach to maintain compatibility with our
 * Mantine Hub-generated theme.
 */
export const cssVariableResolver: CSSVariablesResolver = (theme) => {
  const v8Vars = v8CssVariablesResolver(theme);
  const customVars = shadcnCssVariableResolver(theme);

  return {
    variables: { ...v8Vars.variables, ...customVars.variables },
    light: { ...v8Vars.light, ...customVars.light },
    dark: { ...v8Vars.dark, ...customVars.dark }
  };
};
