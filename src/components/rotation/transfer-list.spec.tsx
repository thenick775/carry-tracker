import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TransferList } from './transfer-list.tsx';
import { renderWithContext, screen } from '../../test/render-with-context.tsx';

describe('<TransferList />', () => {
  it('moves selected items from left to right', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithContext(
      <TransferList
        left={{
          label: 'Items',
          values: [
            { name: 'Knife', value: 'knife' },
            { name: 'Light', value: 'light' }
          ]
        }}
        right={{ label: 'Rotation', values: [] }}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('option', { name: 'Knife' }));
    await user.click(screen.getAllByRole('button')[0]);

    expect(onChange).toHaveBeenCalledWith(
      [{ name: 'Light', value: 'light' }],
      [{ name: 'Knife', value: 'knife' }]
    );
  });

  it('filters visible options by search text', async () => {
    const user = userEvent.setup();

    renderWithContext(
      <TransferList
        left={{
          label: 'Items',
          values: [
            { name: 'Knife', value: 'knife' },
            { name: 'Light', value: 'light' }
          ]
        }}
        right={{ label: 'Rotation', values: [] }}
      />
    );

    await user.type(screen.getByPlaceholderText('Items'), 'lig');

    expect(screen.getByRole('option', { name: 'Light' })).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Knife' })
    ).not.toBeInTheDocument();
  });

  it('moves all items with the transfer-all control', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithContext(
      <TransferList
        left={{
          label: 'Items',
          values: [
            { name: 'Knife', value: 'knife' },
            { name: 'Light', value: 'light' }
          ]
        }}
        right={{ label: 'Rotation', values: [] }}
        onChange={onChange}
      />
    );

    await user.click(screen.getAllByRole('button')[1]);

    expect(onChange).toHaveBeenCalledWith(
      [],
      [
        { name: 'Knife', value: 'knife' },
        { name: 'Light', value: 'light' }
      ]
    );
  });
});
