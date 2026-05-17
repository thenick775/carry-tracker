import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ItemFilters } from './item-filters.tsx';
import { renderWithContext, screen } from '../../test/render-with-context.tsx';

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
  openedFilters = false
}: {
  initialFilters?: CarryItemFilters;
  openedFilters?: boolean;
}) => {
  let nextFilters = initialFilters;
  const setFilters = (
    value: CarryItemFilters | ((current: CarryItemFilters) => CarryItemFilters)
  ) => {
    nextFilters = typeof value === 'function' ? value(nextFilters) : value;
  };

  renderWithContext(
    <ItemFilters
      closeFilters={() => undefined}
      filterOptions={filterOptions}
      filteredItemCount={3}
      filters={initialFilters}
      openedFilters={openedFilters}
      openFilters={() => undefined}
      setFilters={setFilters}
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
});
