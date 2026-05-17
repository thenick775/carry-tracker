import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CarryTrackerAppShell } from './app-shell.tsx';
import * as carriesOverTimeHooks from '../hooks/use-carries-over-time.ts';
import * as carryItemFilterOptionHooks from '../hooks/use-carry-item-filter-options.ts';
import * as carryItemHooks from '../hooks/use-carry-items.ts';
import * as objectUrlHooks from '../hooks/use-object-urls.ts';
import * as rotationHooks from '../hooks/use-rotations.ts';
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
    vi.spyOn(objectUrlHooks, 'useObjectUrls').mockReturnValue([]);
    vi.spyOn(carriesOverTimeHooks, 'useCarryHistory').mockReturnValue({
      carryHistory: [],
      totalCarryHistoryEntries: 0,
      firstRecordedAt: undefined,
      lastRecordedAt: undefined,
      saveCarryHistory: vi.fn()
    });
    vi.spyOn(carriesOverTimeHooks, 'useCarriesOverTime').mockReturnValue([]);
    vi.spyOn(rotationHooks, 'useRotations').mockReturnValue({
      rotations: [],
      createRotation: vi.fn(),
      updateRotation: vi.fn(),
      deleteRotation: vi.fn()
    });
    vi.spyOn(rotationHooks, 'useActiveRotations').mockReturnValue([]);
  });

  it('renders the items view by default', () => {
    renderWithContext(<CarryTrackerAppShell />);

    expect(screen.getByText('Your item list is empty')).toBeInTheDocument();
  });

  it('switches views from the navigation', async () => {
    const user = userEvent.setup();

    renderWithContext(<CarryTrackerAppShell />);

    await user.click(screen.getByRole('button', { name: 'Carry Stats' }));
    expect(screen.getByText('Carry Stats:')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Import/Export' }));
    expect(
      screen.getByText('Import and export your database here!')
    ).toBeInTheDocument();
  });

  it('renders the github link', () => {
    renderWithContext(<CarryTrackerAppShell />);

    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/thenick775/carry-tracker'
    );
  });
});
