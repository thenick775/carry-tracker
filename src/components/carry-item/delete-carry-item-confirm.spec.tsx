import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DeleteCarryItemConfirm } from './delete-carry-item-confirm.tsx';
import * as responsiveHooks from '../../hooks/use-is-larger-than-phone.ts';
import { renderWithContext, screen } from '../../test/render-with-context.tsx';

describe('DeleteCarryItemConfirm', () => {
  it('shows the item name and confirms delete before closing', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const close = vi.fn();

    vi.spyOn(responsiveHooks, 'useIsLargerThanPhone').mockReturnValue(true);

    renderWithContext(
      <DeleteCarryItemConfirm
        carryItemName="Knife"
        opened
        close={close}
        onConfirm={onConfirm}
      />
    );

    expect(
      screen.getByText(
        (_, node) =>
          node?.textContent === 'Delete Knife? This action cannot be undone.'
      )
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onConfirm).toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
  });

  it('falls back to generic item text and cancels cleanly', async () => {
    const user = userEvent.setup();
    const close = vi.fn();

    renderWithContext(
      <DeleteCarryItemConfirm
        opened
        close={close}
        onConfirm={() => undefined}
      />
    );

    expect(
      screen.getByText(
        (_, node) =>
          node?.textContent ===
          'Delete this item? This action cannot be undone.'
      )
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(close).toHaveBeenCalled();
  });

  it('uses the mobile drawer layout by default', () => {
    renderWithContext(
      <DeleteCarryItemConfirm
        opened
        close={() => undefined}
        onConfirm={() => undefined}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete item')).toBeInTheDocument();
  });
});
