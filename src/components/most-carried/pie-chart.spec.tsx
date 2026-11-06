import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PieChart } from './pie-chart.tsx';
import {
  act,
  renderWithContext,
  screen
} from '../../../test/render-with-context.tsx';

describe('<PieChart />', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('filters out zero-value series before rendering', async () => {
    renderWithContext(
      <PieChart
        data={[
          { name: 'Knife', value: 5, color: 'blue' },
          { name: 'Light', value: 0, color: 'green' },
          { name: 'Wallet', value: 7, color: 'red' }
        ]}
      />
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_400);
    });

    expect(screen.getByRole('img', { name: 'Knife: 5' })).toBeVisible();
    expect(screen.getByRole('img', { name: 'Wallet: 7' })).toBeVisible();
    expect(
      screen.queryByRole('img', { name: 'Light: 0' })
    ).not.toBeInTheDocument();
  });

  it('shows the hovered series in the tooltip', async () => {
    const user = userEvent.setup();

    renderWithContext(
      <PieChart data={[{ name: 'Knife', value: 5, color: 'blue' }]} />
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_400);
    });
    // avoid deadlock with user event
    vi.useRealTimers();

    await user.hover(screen.getByRole('img', { name: 'Knife: 5' }));

    expect(screen.getByText('Knife: 5')).toBeVisible();
  });
});
