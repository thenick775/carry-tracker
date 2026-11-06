import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TransferList } from './transfer-list.tsx';
import {
  renderWithContext,
  screen
} from '../../../test/render-with-context.tsx';

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
    await user.click(
      screen.getByRole('button', { name: 'Move selected to rotation' })
    );

    expect(onChange).toHaveBeenCalledExactlyOnceWith(
      [{ name: 'Light', value: 'light' }],
      [{ name: 'Knife', value: 'knife' }]
    );
  });

  it('deselects an item before transferring', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithContext(
      <TransferList
        left={{
          label: 'Items',
          values: [{ name: 'Knife', value: 'knife' }]
        }}
        right={{ label: 'Rotation', values: [] }}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('option', { name: 'Knife' }));
    await user.click(screen.getByRole('option', { name: 'Knife' }));
    await user.click(
      screen.getByRole('button', { name: 'Move selected to rotation' })
    );

    expect(onChange).toHaveBeenCalledExactlyOnceWith(
      [{ name: 'Knife', value: 'knife' }],
      []
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

    expect(screen.getByRole('option', { name: 'Light' })).toBeVisible();
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

    await user.click(
      screen.getByRole('button', { name: 'Move all to rotation' })
    );

    expect(onChange).toHaveBeenCalledExactlyOnceWith(
      [],
      [
        { name: 'Knife', value: 'knife' },
        { name: 'Light', value: 'light' }
      ]
    );
  });

  it('moves selected items from right to left', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithContext(
      <TransferList
        left={{ label: 'Items', values: [] }}
        right={{
          label: 'Rotation',
          values: [
            { name: 'Knife', value: 'knife' },
            { name: 'Light', value: 'light' }
          ]
        }}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('option', { name: 'Knife' }));
    await user.click(
      screen.getByRole('button', { name: 'Move selected to items' })
    );

    expect(onChange).toHaveBeenCalledExactlyOnceWith(
      [{ name: 'Knife', value: 'knife' }],
      [{ name: 'Light', value: 'light' }]
    );
  });

  it('moves all items from right to left', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithContext(
      <TransferList
        left={{ label: 'Items', values: [] }}
        right={{
          label: 'Rotation',
          values: [
            { name: 'Knife', value: 'knife' },
            { name: 'Light', value: 'light' }
          ]
        }}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Move all to items' }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith(
      [
        { name: 'Knife', value: 'knife' },
        { name: 'Light', value: 'light' }
      ],
      []
    );
  });
});
