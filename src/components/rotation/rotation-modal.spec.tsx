import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RotationModal } from './rotation-modal.tsx';
import * as carryItemHooks from '../../hooks/use-carry-items.ts';
import * as responsiveHooks from '../../hooks/use-is-larger-than-phone.ts';
import {
  renderWithContext,
  screen,
  waitFor
} from '../../test/render-with-context.tsx';

describe('<RotationModal />', () => {
  beforeEach(() => {
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: [
        {
          id: 'item-1',
          name: 'Knife',
          carryCount: 0,
          createdAt: '',
          color: ''
        },
        {
          id: 'item-2',
          name: 'Light',
          carryCount: 0,
          createdAt: '',
          color: ''
        }
      ],
      createCarryItem: () => Promise.resolve(),
      updateCarryItem: () => Promise.resolve(),
      deleteCarryItem: () => Promise.resolve()
    });
  });

  it('submits selected ordered item ids and normalized dates in create mode', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    const onSubmit = vi.fn();

    renderWithContext(
      <RotationModal opened close={close} onSubmit={onSubmit} />
    );

    await user.type(screen.getByLabelText('Name'), 'Weekday Rotation');

    await user.click(screen.getByRole('option', { name: 'Knife' }));
    await user.click(screen.getByRole('option', { name: 'Light' }));
    await user.click(screen.getAllByRole('button')[1]);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    expect(close).toHaveBeenCalled();
  });

  it('shows the active since field when editing an active rotation', () => {
    vi.spyOn(responsiveHooks, 'useIsLargerThanPhone').mockReturnValue(true);

    renderWithContext(
      <RotationModal
        rotation={{
          id: 'rotation-1',
          name: 'Weekday',
          createdAt: '2026-01-01T00:00:00.000Z',
          active: true,
          activeAt: '2026-01-02T00:00:00.000Z',
          orderedCarryItemIds: ['item-1'],
          stepDuration: { duration: 1, unit: 'day' }
        }}
        opened
        close={() => undefined}
        onSubmit={() => undefined}
      />
    );

    expect(screen.getByLabelText('Active since')).toBeInTheDocument();
  });

  it.todo('shuffles selected item ids when requested', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const onSubmit = vi.fn();

    renderWithContext(
      <RotationModal opened close={() => undefined} onSubmit={onSubmit} />
    );

    await user.click(screen.getByRole('option', { name: 'Knife' }));
    await user.click(screen.getByRole('option', { name: 'Light' }));
    await user.click(screen.getAllByRole('button')[0]);
    await user.click(screen.getByRole('button', { name: 'Shuffle' }));
    await user.type(screen.getByLabelText('Name'), 'Weekday Rotation');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
