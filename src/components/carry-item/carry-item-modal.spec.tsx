import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CarryItemModal } from './carry-item-modal.tsx';
import * as responsiveHooks from '../../hooks/use-is-larger-than-phone.ts';
import {
  renderWithContext,
  screen,
  waitFor
} from '../../test/render-with-context.tsx';

import type { CustomFields } from '../../db/db.ts';

const customFieldsValueMap: Record<string, CustomFields> = {
  Brand: [{ name: 'Brand', value: 'Benchmade' }]
};

describe('CarryItemModal', () => {
  it('does not submit create mode without an image', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    const onSubmit = vi.fn();

    renderWithContext(
      <CarryItemModal
        customFieldsValueMap={customFieldsValueMap}
        opened
        close={close}
        onSubmit={onSubmit}
      />
    );

    await user.type(screen.getByLabelText('Name'), '  Knife  ');
    await user.click(screen.getByLabelText('Add field'));
    await user.type(screen.getByPlaceholderText('e.g. Brand'), ' Brand ');
    await user.type(
      screen.getByPlaceholderText('e.g. your brand'),
      ' Benchmade '
    );
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
    expect(close).not.toHaveBeenCalled();
  });

  it('renders update mode title and default values', () => {
    vi.spyOn(responsiveHooks, 'useIsLargerThanPhone').mockReturnValue(true);

    renderWithContext(
      <CarryItemModal
        carryItem={{
          id: 'item-1',
          name: 'Knife',
          carryCount: 5,
          createdAt: '2026-01-01T00:00:00.000Z',
          color: '#0000ff',
          cost: 100,
          customFields: [{ name: 'Brand', value: 'Benchmade' }]
        }}
        customFieldsValueMap={{}}
        opened
        close={() => undefined}
        onSubmit={() => undefined}
      />
    );

    expect(screen.getByText('Update Carry Item')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Knife')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
  });

  it('adds and removes custom fields', async () => {
    const user = userEvent.setup();

    renderWithContext(
      <CarryItemModal
        customFieldsValueMap={{}}
        opened
        close={() => undefined}
        onSubmit={() => undefined}
      />
    );

    await user.click(screen.getByLabelText('Add field'));
    expect(screen.getByPlaceholderText('e.g. Brand')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Remove field'));
    expect(
      screen.getByPlaceholderText(
        'Add custom fields (e.g. Brand, Model, Steel...)'
      )
    ).toBeInTheDocument();
  });
});
