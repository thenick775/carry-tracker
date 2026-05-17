import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SeriesPickerDrawer } from './series-picker-drawer.tsx';
import { renderWithContext, screen } from '../../test/render-with-context.tsx';

describe('<SeriesPickerDrawer />', () => {
  it('filters visible items by search and clears the search', async () => {
    const user = userEvent.setup();

    renderWithContext(
      <SeriesPickerDrawer
        opened
        onClose={() => undefined}
        onShowAll={() => undefined}
        onShowTopFive={() => undefined}
        onClearSelection={() => undefined}
        items={[
          { id: 'item-1', name: 'Knife', color: 'blue' },
          { id: 'item-2', name: 'Light', color: 'green' }
        ]}
        selectedItemIds={['item-1']}
        onToggleItem={() => undefined}
      />
    );

    await user.type(screen.getByPlaceholderText('Search items'), 'lig');
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.queryByText('Knife')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(screen.getByText('Knife')).toBeInTheDocument();
  });

  it('fires bulk selection and toggle callbacks', async () => {
    const user = userEvent.setup();
    const onShowAll = vi.fn();
    const onShowTopFive = vi.fn();
    const onClearSelection = vi.fn();
    const onToggleItem = vi.fn();

    renderWithContext(
      <SeriesPickerDrawer
        opened
        onClose={() => undefined}
        onShowAll={onShowAll}
        onShowTopFive={onShowTopFive}
        onClearSelection={onClearSelection}
        items={[{ id: 'item-1', name: 'Knife', color: 'blue' }]}
        selectedItemIds={['item-1']}
        onToggleItem={onToggleItem}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Show all' }));
    await user.click(screen.getByRole('button', { name: 'Hide all' }));
    await user.click(screen.getByRole('button', { name: 'Show top 5' }));
    await user.click(screen.getByRole('button', { name: 'Knife On' }));

    expect(onShowAll).toHaveBeenCalled();
    expect(onClearSelection).toHaveBeenCalled();
    expect(onShowTopFive).toHaveBeenCalled();
    expect(onToggleItem).toHaveBeenCalledWith('item-1');
  });
});
