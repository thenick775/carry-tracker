import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ItemFilters } from './item-filters.tsx';
import {
  renderWithContext,
  screen
} from '../../../test/render-with-context.tsx';

import type { CarryItemFilterOptions } from '../../hooks/use-carry-item-filter-options.ts';
import type { CarryItemFilters } from '../../hooks/use-carry-items.ts';

const filterOptions = {
  createdAtRange: [
    new Date(2026, 0, 1).valueOf(),
    new Date(2026, 0, 10).valueOf()
  ] as [number, number],
  carryCountRange: [0, 10] as [number, number],
  costRange: [0, 100] as [number, number],
  customFieldOptions: {
    Brand: ['Benchmade', 'Spyderco']
  },
  customFieldsValueMap: {
    Brand: [{ name: 'Brand', value: 'Benchmade' }]
  }
};

const renderFilters = ({
  initialFilters = {},
  openedFilters = false,
  filterOptionsOverride,
  closeFilters = () => undefined,
  setSort = () => undefined
}: {
  initialFilters?: CarryItemFilters;
  openedFilters?: boolean;
  filterOptionsOverride?: Partial<CarryItemFilterOptions>;
  closeFilters?: () => void;
  setSort?: () => void;
}) => {
  let nextFilters = initialFilters;
  const setFilters = (
    value: CarryItemFilters | ((current: CarryItemFilters) => CarryItemFilters)
  ) => {
    nextFilters = typeof value === 'function' ? value(nextFilters) : value;
  };

  renderWithContext(
    <ItemFilters
      closeFilters={closeFilters}
      filterOptions={{ ...filterOptions, ...filterOptionsOverride }}
      filteredItemCount={3}
      filters={initialFilters}
      openedFilters={openedFilters}
      openFilters={() => undefined}
      setFilters={setFilters}
      setSort={setSort}
    />
  );

  return {
    getFilters: () => nextFilters
  };
};

describe('<ItemFilters />', () => {
  it('updates the search filter from user input', async () => {
    const user = userEvent.setup();
    const { getFilters } = renderFilters({ initialFilters: {} });

    await user.type(screen.getByPlaceholderText('Search by name'), 'knife');

    expect(getFilters()).toEqual({ search: 'knife' });
  });

  it('clears the search filter from the clear-search action', async () => {
    const user = userEvent.setup();
    const { getFilters } = renderFilters({
      initialFilters: { search: 'knife' }
    });

    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(getFilters()).toEqual({ search: '' });
  });

  it('removes an active custom-field badge filter when clicked', async () => {
    const user = userEvent.setup();
    const { getFilters } = renderFilters({
      initialFilters: {
        customFields: {
          Brand: ['Benchmade']
        }
      }
    });

    await user.click(screen.getByRole('button', { name: /Brand: 1/i }));

    expect(getFilters()).toEqual({ customFields: undefined });
  });

  it('updates custom field selections from the drawer', async () => {
    const user = userEvent.setup();
    const { getFilters } = renderFilters({ openedFilters: true });

    await user.click(screen.getByRole('button', { name: 'Brand' }));
    await user.click(screen.getByText('Benchmade'));

    expect(getFilters()).toEqual({
      customFields: {
        Brand: ['Benchmade']
      }
    });
  });

  it('clears all filters from the drawer', async () => {
    const user = userEvent.setup();
    const { getFilters } = renderFilters({
      openedFilters: true,
      initialFilters: {
        search: 'knife',
        customFields: { Brand: ['Benchmade'] },
        carryCount: [1, 5]
      }
    });

    await user.click(screen.getByRole('button', { name: 'Clear all' }));

    expect(getFilters()).toEqual({});
  });

  it('renders the empty custom-fields state when no custom field options exist', () => {
    renderFilters({
      openedFilters: true,
      filterOptionsOverride: { customFieldOptions: {} }
    });

    expect(
      screen.getByText('No custom fields available yet.')
    ).toBeInTheDocument();
  });

  it('closes the drawer from the results button', async () => {
    const user = userEvent.setup();
    const closeFilters = vi.fn();

    renderFilters({ openedFilters: true, closeFilters });

    await user.click(screen.getByRole('button', { name: 'See 3 results' }));

    expect(closeFilters).toHaveBeenCalled();
  });

  it('removes the active date badge filter when clicked', async () => {
    const user = userEvent.setup();
    const { getFilters } = renderFilters({
      initialFilters: {
        createdAt: [
          new Date(2026, 0, 2).valueOf(),
          new Date(2026, 0, 5).valueOf()
        ]
      }
    });

    await user.click(screen.getByRole('button', { name: 'Date added' }));

    expect(getFilters()).toEqual({ createdAt: undefined });
  });

  it('removes the active carry-count badge filter when clicked', async () => {
    const user = userEvent.setup();
    const { getFilters } = renderFilters({
      initialFilters: {
        carryCount: [1, 5]
      }
    });

    await user.click(screen.getByRole('button', { name: 'Carry count' }));

    expect(getFilters()).toEqual({ carryCount: undefined });
  });

  it('removes the active cost badge filter when clicked', async () => {
    const user = userEvent.setup();
    const { getFilters } = renderFilters({
      initialFilters: {
        cost: [10, 50]
      }
    });

    await user.click(screen.getByRole('button', { name: 'Cost' }));

    expect(getFilters()).toEqual({ cost: undefined });
  });
});
