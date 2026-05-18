import { Accordion } from '@mantine/core';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CarryHistoryEntryAccordionItem } from './carry-history-entry-accordion-item.tsx';
import { renderWithContext, screen } from '../../test/render-with-context.tsx';

describe('<CarryHistoryEntryAccordionItem />', () => {
  it('renders carry history entry data', () => {
    renderWithContext(
      <Accordion defaultValue="entry-1">
        <CarryHistoryEntryAccordionItem
          entry={{
            id: 'entry-1',
            createdAt: '2026-01-01T08:00:00.000Z',
            currentCarryCount: 4
          }}
          delta={2}
          error={{}}
          onUpdate={() => undefined}
          onDelete={() => undefined}
        />
      </Accordion>
    );

    expect(screen.getByText('Jan 01, 2026')).toBeVisible();
    expect(screen.getByLabelText('Recorded at')).toHaveTextContent(
      'Jan 01 2026 12:00:00 AM'
    );
    expect(screen.getByText('+2 from previous')).toBeVisible();
    expect(screen.getByLabelText('Carry count')).toHaveValue('4');
  });

  it('updates carry count and created at', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();

    renderWithContext(
      <Accordion defaultValue="entry-1">
        <CarryHistoryEntryAccordionItem
          entry={{
            id: 'entry-1',
            createdAt: '2026-01-01T00:00:00.000Z',
            currentCarryCount: 4
          }}
          error={{}}
          onUpdate={onUpdate}
          onDelete={() => undefined}
        />
      </Accordion>
    );

    await user.clear(screen.getByLabelText('Carry count'));
    await user.type(screen.getByLabelText('Carry count'), '7');
    await user.click(screen.getByLabelText('Recorded at'));
    await user.click(screen.getByRole('button', { name: '5 December 2025' }));

    expect(onUpdate).toHaveBeenCalledWith({
      currentCarryCount: 7
    });
    expect(onUpdate).toHaveBeenCalledWith({
      createdAt: '2025-12-05 16:00:00'
    });
  });

  it('shows starting entry text and fires delete', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    renderWithContext(
      <Accordion defaultValue="entry-1">
        <CarryHistoryEntryAccordionItem
          entry={{
            id: 'entry-1',
            createdAt: '2026-01-01T00:00:00.000Z',
            currentCarryCount: 4
          }}
          error={{ date: 'Bad date', count: 'Bad count' }}
          onUpdate={() => undefined}
          onDelete={onDelete}
        />
      </Accordion>
    );

    expect(screen.getByText('Starting entry')).toBeVisible();
    expect(screen.getByLabelText('Recorded at')).toBeVisible();
    expect(screen.getByLabelText('Carry count')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalled();
  });
});
