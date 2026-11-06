import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RotationModal } from './rotation-modal.tsx';
import {
  renderWithContext,
  screen,
  waitFor
} from '../../../test/render-with-context.tsx';
import * as carryItemHooks from '../../hooks/use-carry-items.ts';
import * as responsiveHooks from '../../hooks/use-is-larger-than-phone.ts';

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

  it('shows a validation error when submitted without a name', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderWithContext(
      <RotationModal opened close={() => undefined} onSubmit={onSubmit} />
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(screen.getByText('Invalid name')).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects invalid stored dates', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderWithContext(
      <RotationModal
        rotation={{
          id: 'rotation-1',
          name: 'Weekday',
          createdAt: 'invalid',
          active: true,
          activeAt: 'invalid',
          orderedCarryItemIds: [],
          stepDuration: { duration: 1, unit: 'day' }
        }}
        opened
        close={() => undefined}
        onSubmit={onSubmit}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(screen.getByText('Invalid active at date time')).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('renders empty transfer lists while carry items are unavailable', () => {
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: undefined,
      createCarryItem: () => Promise.resolve(),
      updateCarryItem: () => Promise.resolve(),
      deleteCarryItem: () => Promise.resolve()
    });

    renderWithContext(
      <RotationModal
        opened
        close={() => undefined}
        onSubmit={() => undefined}
      />
    );

    expect(screen.getAllByText('No Values')).toHaveLength(2);
  });

  it('omits deleted items from an existing rotation', () => {
    renderWithContext(
      <RotationModal
        rotation={{
          id: 'rotation-1',
          name: 'Weekday',
          createdAt: '2026-01-01T00:00:00.000Z',
          active: false,
          orderedCarryItemIds: ['deleted-item'],
          stepDuration: { duration: 1, unit: 'day' }
        }}
        opened
        close={() => undefined}
        onSubmit={() => undefined}
      />
    );

    expect(screen.getByText('No Values')).toBeVisible();
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
    await user.click(
      screen.getByRole('button', { name: 'Move selected to rotation' })
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce();
    });
    expect(close).toHaveBeenCalledOnce();
  });

  it('submits the active date when editing an active rotation', async () => {
    vi.spyOn(responsiveHooks, 'useIsLargerThanPhone').mockReturnValue(true);
    const user = userEvent.setup();
    const onSubmit = vi.fn();

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
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByLabelText('Active since')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ activeAt: '2026-01-02T00:00:00.000Z' })
    );
  });

  it('submits inactive rotations without an active date', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderWithContext(
      <RotationModal opened close={() => undefined} onSubmit={onSubmit} />
    );

    await user.type(screen.getByLabelText('Name'), 'Weekend Rotation');
    await user.click(screen.getByRole('switch', { name: 'Active' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ active: false, activeAt: undefined })
    );
  });

  it('shuffles selected item ids when requested', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderWithContext(
      <RotationModal opened close={() => undefined} onSubmit={onSubmit} />
    );

    await user.click(screen.getByRole('option', { name: 'Knife' }));
    await user.click(screen.getByRole('option', { name: 'Light' }));
    await user.click(
      screen.getByRole('button', { name: 'Move selected to rotation' })
    );
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    await user.click(screen.getByRole('button', { name: 'Shuffle' }));
    random.mockRestore();

    await waitFor(() => {
      expect(
        screen.getAllByRole('option').map((option) => option.textContent)
      ).toEqual(['Light', 'Knife']);
    });

    await user.type(screen.getByLabelText('Name'), 'Weekday Rotation');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ orderedCarryItemIds: ['item-2', 'item-1'] })
      );
    });
  });
});
