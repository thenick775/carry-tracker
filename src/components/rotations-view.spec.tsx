import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RotationsView } from './rotations-view.tsx';
import * as carryItemHooks from '../hooks/use-carry-items.ts';
import * as rotationHooks from '../hooks/use-rotations.ts';
import {
  renderWithContext,
  screen,
  waitFor
} from '../test/render-with-context.tsx';

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
        }
      ],
      createRotation: vi.fn(),
      updateRotation: vi.fn(),
      deleteRotation: vi.fn()
    });
  });

  it('renders rotation cards', () => {
    renderWithContext(<RotationsView />);

    expect(screen.getByText('Weekday')).toBeInTheDocument();
    expect(screen.getByText('Rotations:')).toBeInTheDocument();
  });

  it('opens create flow from the add button', async () => {
    const user = userEvent.setup();

    renderWithContext(<RotationsView />);

    await user.click(screen.getByRole('button', { name: 'Add item' }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('opens edit flow and deletes an existing rotation', async () => {
    const user = userEvent.setup();
    const deleteRotationSpy = vi.fn();

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
      deleteRotation: deleteRotationSpy
    });

    renderWithContext(<RotationsView />);

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('Name')).toHaveValue('Weekday');

    await user.click(screen.getByRole('button', { name: 'Delete tracker' }));
    await waitFor(() => {
      expect(deleteRotationSpy).toHaveBeenCalledWith('rotation-1');
    });
  });
});
