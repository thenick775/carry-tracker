import { Accordion } from '@mantine/core';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CarryHistoryEntryAccordionItem } from './carry-history-entry-accordion-item.tsx';
import { renderWithContext, screen } from '../../test/render-with-context.tsx';

describe('<CarryHistoryEntryAccordionItem />', () => {
  it('shows delta text and updates carry count', async () => {
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
          delta={2}
          error={{}}
          onUpdate={onUpdate}
          onDelete={() => undefined}
        />
      </Accordion>
    );

    expect(screen.getByText('+2 from previous')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Carry count'));
    await user.type(screen.getByLabelText('Carry count'), '7');

    expect(onUpdate).toHaveBeenLastCalledWith({ currentCarryCount: 7 });
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

    expect(screen.getByText('Starting entry')).toBeInTheDocument();
    expect(screen.getByLabelText('Recorded at')).toBeInTheDocument();
    expect(screen.getByLabelText('Carry count')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalled();
  });
});
