import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CarryItemCard } from './carry-item-card.tsx';
import { renderWithContext, screen } from '../../test/render-with-context.tsx';

describe('<CarryItemCard />', () => {
  it('renders formatted item details', () => {
    renderWithContext(
      <CarryItemCard
        item={{
          id: 'item-1',
          name: 'Knife',
          carryCount: 1234,
          createdAt: '2026-01-01T00:00:00.000Z',
          color: 'blue'
        }}
        imageUrl="blob:knife"
        onDelete={() => undefined}
        onRequestEdit={() => undefined}
        onRequestHistory={() => undefined}
        onIncreaseCount={() => undefined}
      />
    );

    expect(screen.getByText('Knife')).toBeInTheDocument();
    expect(screen.getByText(/^Added:/)).toBeInTheDocument();
    expect(screen.getByText(/^Carry Count:/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Knife' })).toHaveAttribute(
      'src',
      'blob:knife'
    );
  });

  it('fires edit, history, delete, and increase callbacks', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const onRequestEdit = vi.fn();
    const onRequestHistory = vi.fn();
    const onIncreaseCount = vi.fn();

    renderWithContext(
      <CarryItemCard
        item={{
          id: 'item-1',
          name: 'Knife',
          carryCount: 1,
          createdAt: '2026-01-01T00:00:00.000Z',
          color: 'blue'
        }}
        imageUrl="blob:knife"
        onDelete={onDelete}
        onRequestEdit={onRequestEdit}
        onRequestHistory={onRequestHistory}
        onIncreaseCount={onIncreaseCount}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Delete tracker' }));
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'History' }));
    await user.click(screen.getByRole('button', { name: 'Increase Count' }));

    expect(onDelete).toHaveBeenCalled();
    expect(onRequestEdit).toHaveBeenCalled();
    expect(onRequestHistory).toHaveBeenCalled();
    expect(onIncreaseCount).toHaveBeenCalled();
  });
});
