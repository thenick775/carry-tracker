import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RotationsView } from './rotations-view.tsx';
import { renderWithContext, screen } from '../../test/render-with-context.tsx';
import * as carryItemHooks from '../hooks/use-carry-items.ts';
import * as rotationHooks from '../hooks/use-rotations.ts';

describe('<RotationsView />', () => {
  beforeEach(() => {
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: [
        {
          id: 'item-1',
          name: 'Knife',
          carryCount: 0,
          createdAt: '',
          color: ''
        }
      ],
      createCarryItem: () => Promise.resolve(),
      updateCarryItem: () => Promise.resolve(),
      deleteCarryItem: () => Promise.resolve()
    });
    vi.spyOn(rotationHooks, 'useRotations').mockReturnValue({
      rotations: [
        {
          id: 'rotation-1',
          name: 'Weekday',
          active: true,
          createdAt: '2026-01-01T00:00:00.000Z',
          activeAt: '2026-01-02T00:00:00.000Z',
          orderedCarryItemIds: ['item-1'],
          stepDuration: { duration: 1, unit: 'day' }
        },
        {
          id: 'rotation-2',
          name: 'Weekday2',
          active: true,
          createdAt: '2026-01-01T00:00:00.000Z',
          activeAt: '2026-01-02T00:00:00.000Z',
          orderedCarryItemIds: ['item-1'],
          stepDuration: { duration: 1, unit: 'day' }
        }
      ],
      createRotation: vi.fn(),
      updateRotation: vi.fn(),
      deleteRotation: vi.fn()
    });
  });

  it('renders the empty state with no data', () => {
    vi.spyOn(rotationHooks, 'useRotations').mockReturnValue({
      rotations: [],
      createRotation: vi.fn(),
      updateRotation: vi.fn(),
      deleteRotation: vi.fn()
    });

    renderWithContext(<RotationsView />);

    expect(screen.getByText('Your rotation list is empty')).toBeInTheDocument();
  });

  it('renders rotation cards', () => {
    renderWithContext(<RotationsView />);

    expect(screen.getByText('Rotations:')).toBeInTheDocument();
    expect(screen.getByText('Weekday')).toBeVisible();
    expect(screen.getByText('Weekday2')).toBeVisible();
  });

  it('creates a rotation from the add button', async () => {
    const user = userEvent.setup();
    const createRotation = vi.fn();

    vi.spyOn(rotationHooks, 'useRotations').mockReturnValue({
      rotations: [],
      createRotation,
      updateRotation: vi.fn(),
      deleteRotation: vi.fn()
    });

    renderWithContext(<RotationsView />);

    await user.click(screen.getByRole('button', { name: 'Add item' }));
    await user.type(screen.getByLabelText('Name'), 'Weekend');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(createRotation).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Weekend' })
    );
  });

  it('updates an existing rotation and resets the create form', async () => {
    const user = userEvent.setup();
    const updateRotation = vi.fn();

    vi.spyOn(rotationHooks, 'useRotations').mockReturnValue({
      rotations: [
        {
          id: 'rotation-1',
          name: 'Weekday',
          active: true,
          createdAt: '2026-01-01T00:00:00.000Z',
          activeAt: '2026-01-02T00:00:00.000Z',
          orderedCarryItemIds: ['item-1'],
          stepDuration: { duration: 1, unit: 'day' }
        }
      ],
      createRotation: vi.fn(),
      updateRotation,
      deleteRotation: vi.fn()
    });

    renderWithContext(<RotationsView />);

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Weekday');

    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Updated Weekday');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(updateRotation).toHaveBeenCalledWith(
      'rotation-1',
      expect.objectContaining({ name: 'Updated Weekday' })
    );

    await user.click(screen.getByRole('button', { name: 'Add item' }));

    expect(screen.getByLabelText('Name')).toHaveValue('');

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('deletes an existing rotation', async () => {
    const user = userEvent.setup();
    const deleteRotation = vi.fn();

    vi.spyOn(rotationHooks, 'useRotations').mockReturnValue({
      rotations: [
        {
          id: 'rotation-1',
          name: 'Weekday',
          active: true,
          createdAt: '2026-01-01T00:00:00.000Z',
          activeAt: '2026-01-02T00:00:00.000Z',
          orderedCarryItemIds: ['item-1'],
          stepDuration: { duration: 1, unit: 'day' }
        }
      ],
      createRotation: vi.fn(),
      updateRotation: vi.fn(),
      deleteRotation
    });

    renderWithContext(<RotationsView />);

    await user.click(screen.getByRole('button', { name: 'Delete tracker' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(deleteRotation).toHaveBeenCalledExactlyOnceWith('rotation-1');
  });
});
