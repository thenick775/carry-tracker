import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CarryTrackerAppShell } from './app-shell.tsx';
import * as carryItemFilterOptionHooks from '../hooks/use-carry-item-filter-options.ts';
import * as carryItemHooks from '../hooks/use-carry-items.ts';
import { renderWithContext, screen } from '../test/render-with-context.tsx';

describe('<CarryTrackerAppShell />', () => {
  beforeEach(() => {
    vi.spyOn(
      carryItemFilterOptionHooks,
      'useCarryItemFilterOptions'
    ).mockReturnValue({
      customFieldOptions: {},
      customFieldsValueMap: {}
    });
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: [],
      createCarryItem: vi.fn(),
      updateCarryItem: vi.fn(),
      deleteCarryItem: vi.fn()
    });
  });

  it('renders the items view by default', () => {
    renderWithContext(<CarryTrackerAppShell />);

    expect(screen.getByText('Your item list is empty')).toBeVisible();
  });

  it.each([
    ['Carry Stats', 'Carry Stats:'],
    ['Rotations', 'Rotations:'],
    ['Rotation Timeline', 'Your rotation timeline is empty'],
    ['Import/Export', 'Import and export your database here!']
  ])(
    'switches views from navigation to %s',
    async (navItem, expectedPageText) => {
      const user = userEvent.setup();

      renderWithContext(<CarryTrackerAppShell />);
      // starts on items page
      expect(screen.getByText('Your item list is empty')).toBeVisible();

      await user.click(screen.getByRole('button', { name: navItem }));

      expect(
        screen.queryByText('Your item list is empty')
      ).not.toBeInTheDocument();
      expect(screen.getByText(`${expectedPageText}`)).toBeVisible();
    }
  );

  it('switches back to items view', async () => {
    const user = userEvent.setup();

    renderWithContext(<CarryTrackerAppShell />);

    expect(screen.getByText('Your item list is empty')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Carry Stats' }));
    expect(
      screen.queryByText('Your item list is empty')
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Items' }));
    expect(screen.getByText('Your item list is empty')).toBeVisible();
  });

  it('renders the github link', () => {
    renderWithContext(<CarryTrackerAppShell />);

    expect(screen.getByRole('link', { name: 'GitHub' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/thenick775/carry-tracker'
    );
  });
});
