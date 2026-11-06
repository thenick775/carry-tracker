import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ItemFilters } from './item-filters.tsx';
import {
  renderWithContext,
  screen
} from '../../../test/render-with-context.tsx';

describe('<ItemFilters />', () => {
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

  it('renders the empty custom-fields state when no custom field options exist', () => {
    renderWithContext(
      <ItemFilters
        closeFilters={() => undefined}
        filterOptions={{ ...filterOptions, customFieldOptions: {} }}
        filteredItemCount={3}
        filters={{}}
        openedFilters
        openFilters={() => undefined}
        setFilters={vi.fn()}
        setSort={() => undefined}
      />
    );

    expect(screen.getByText('No custom fields available yet.')).toBeVisible();
  });

  it('renders the empty custom-fields state without filter options', () => {
    renderWithContext(
      <ItemFilters
        closeFilters={() => undefined}
        filteredItemCount={3}
        filters={{}}
        openedFilters
        openFilters={() => undefined}
        setFilters={vi.fn()}
        setSort={() => undefined}
      />
    );

    expect(screen.getByText('No custom fields available yet.')).toBeVisible();
  });

  it('handles missing filter ranges', () => {
    renderWithContext(
      <ItemFilters
        closeFilters={() => undefined}
        filteredItemCount={3}
        filters={{}}
        openedFilters
        openFilters={() => undefined}
        setFilters={vi.fn()}
        setSort={() => undefined}
      />
    );

    expect(screen.getByText('No dates available')).toBeVisible();
    expect(screen.getByText('No counts available')).toBeVisible();
    expect(screen.getByText('No costs available')).toBeVisible();
  });

  it('closes the drawer from the results button', async () => {
    const user = userEvent.setup();
    const closeFiltersSpy = vi.fn();

    renderWithContext(
      <ItemFilters
        closeFilters={closeFiltersSpy}
        filterOptions={filterOptions}
        filteredItemCount={3}
        filters={{}}
        openedFilters
        openFilters={() => undefined}
        setFilters={vi.fn()}
        setSort={() => undefined}
      />
    );

    await user.click(screen.getByRole('button', { name: 'See 3 results' }));

    expect(closeFiltersSpy).toHaveBeenCalledOnce();
  });

  it('uses the singular result label', () => {
    renderWithContext(
      <ItemFilters
        closeFilters={() => undefined}
        filterOptions={filterOptions}
        filteredItemCount={1}
        filters={{}}
        openedFilters
        openFilters={() => undefined}
        setFilters={vi.fn()}
        setSort={() => undefined}
      />
    );

    expect(screen.getByRole('button', { name: 'See 1 result' })).toBeVisible();
  });

  it('sets the selected sort', async () => {
    const user = userEvent.setup();
    const setSortSpy = vi.fn();

    renderWithContext(
      <ItemFilters
        closeFilters={() => undefined}
        filterOptions={filterOptions}
        filteredItemCount={3}
        filters={{}}
        openedFilters
        openFilters={() => undefined}
        setFilters={vi.fn()}
        setSort={setSortSpy}
      />
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('recently-carried'));

    expect(setSortSpy).toHaveBeenCalledExactlyOnceWith('recently-carried');
  });

  it('clears the active sort badge', async () => {
    const user = userEvent.setup();
    const setSortSpy = vi.fn();

    renderWithContext(
      <ItemFilters
        closeFilters={() => undefined}
        filterOptions={filterOptions}
        filteredItemCount={3}
        filters={{}}
        openedFilters={false}
        openFilters={() => undefined}
        setFilters={vi.fn()}
        setSort={setSortSpy}
        sort="recently-carried"
      />
    );

    await user.click(screen.getByRole('button', { name: /Sort by:/i }));

    expect(setSortSpy).toHaveBeenCalledExactlyOnceWith(undefined);
  });
});
