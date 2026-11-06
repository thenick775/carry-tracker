import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CarryItemCard } from './carry-item-card.tsx';
import {
  renderWithContext,
  screen
} from '../../../test/render-with-context.tsx';

describe('<CarryItemCard />', () => {
  it('renders formatted item details', () => {
    renderWithContext(
      <CarryItemCard
        item={{
          id: 'item-1',
          name: 'Knife',
          carryCount: 50,
          createdAt: '2026-01-01T00:00:00.000Z',
          lastCarriedAt: '2026-01-02T12:00:00.000Z',
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
    expect(screen.getByText('Added: Dec 31, 2025')).toBeInTheDocument();
    expect(screen.getByText('Last Carried: Jan 2, 2026')).toBeInTheDocument();
    expect(screen.getByText('Carry Count: 50')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Knife' })).toHaveAttribute(
      'src',
      'blob:knife'
    );
  });

  it.each([
    ['Delete tracker', 'onDelete'],
    ['Edit', 'onRequestEdit'],
    ['History', 'onRequestHistory'],
    ['Increase Count', 'onIncreaseCount']
  ] as const)('calls %s when clicked', async (buttonName, callbackName) => {
    const user = userEvent.setup();
    const callbacks = {
      onDelete: vi.fn(),
      onRequestEdit: vi.fn(),
      onRequestHistory: vi.fn(),
      onIncreaseCount: vi.fn()
    };

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
        {...callbacks}
      />
    );

    await user.click(screen.getByRole('button', { name: buttonName }));

    expect(callbacks[callbackName]).toHaveBeenCalledOnce();
  });
});
