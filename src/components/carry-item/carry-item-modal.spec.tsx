import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CarryItemModal } from './carry-item-modal.tsx';
import {
  renderWithContext,
  screen
} from '../../../test/render-with-context.tsx';
import * as responsiveHooks from '../../hooks/use-is-larger-than-phone.ts';

import type { CustomFields } from '../../db/db.ts';

describe('<CarryItemModal />', () => {
  const customFieldsValueMap: Record<string, CustomFields> = {
    Brand: [{ name: 'Brand', value: 'Benchmade' }]
  };

  it('does not create without an image', async () => {
    const user = userEvent.setup();
    const closeSpy = vi.fn();
    const onSubmitSpy = vi.fn();

    renderWithContext(
      <CarryItemModal
        customFieldsValueMap={customFieldsValueMap}
        opened
        close={closeSpy}
        onSubmit={onSubmitSpy}
      />
    );

    await user.type(screen.getByLabelText('Name'), 'Knife');
    await user.click(screen.getByLabelText('Add field'));
    await user.type(screen.getByPlaceholderText('e.g. Brand'), 'Brand');
    await user.type(
      screen.getByPlaceholderText('e.g. your brand'),
      'Benchmade'
    );
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmitSpy).not.toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Invalid image')).toBeVisible();
  });

  it('does not submit an invalid added date', async () => {
    const user = userEvent.setup();
    const closeSpy = vi.fn();
    const onSubmitSpy = vi.fn();

    renderWithContext(
      <CarryItemModal
        carryItem={{
          id: 'item-1',
          name: 'Knife',
          carryCount: 5,
          createdAt: 'not a date',
          color: '#0000ff',
          imageData: new File(['image'], 'knife.png', { type: 'image/png' })
        }}
        customFieldsValueMap={{}}
        opened
        close={closeSpy}
        onSubmit={onSubmitSpy}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmitSpy).not.toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Invalid added date time')).toBeVisible();
  });

  it('renders title and default values', () => {
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

    expect(screen.getByText('Update Carry Item')).toBeVisible();
    expect(screen.getByDisplayValue('Knife')).toBeVisible();
    expect(screen.getByDisplayValue('5')).toBeVisible();
    expect(screen.getByDisplayValue('$100')).toBeVisible();
    expect(screen.getByDisplayValue('#0000ff')).toBeVisible();
    expect(screen.getByDisplayValue('Brand')).toBeVisible();
    expect(screen.getByDisplayValue('Benchmade')).toBeVisible();
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

    await user.click(
      screen.getByPlaceholderText(
        'Add custom fields (e.g. Brand, Model, Steel...)'
      )
    );
    await user.click(screen.getByLabelText('Add field'));
    expect(screen.getAllByPlaceholderText('e.g. Brand')).toHaveLength(2);

    await user.click(screen.getAllByLabelText('Remove field')[0]);
    await user.click(screen.getByLabelText('Remove field'));
    expect(
      screen.getByPlaceholderText(
        'Add custom fields (e.g. Brand, Model, Steel...)'
      )
    ).toBeVisible();
  });

  it('submits trimmed custom fields and closes', async () => {
    const user = userEvent.setup();
    const closeSpy = vi.fn();
    const onSubmitSpy = vi.fn();
    const image = new File(['image'], 'knife.png', { type: 'image/png' });

    renderWithContext(
      <CarryItemModal
        customFieldsValueMap={customFieldsValueMap}
        opened
        close={closeSpy}
        onSubmit={onSubmitSpy}
      />
    );

    await user.type(screen.getByLabelText('Name'), 'Knife');
    await user.upload(screen.getByLabelText('Image file'), image);
    await user.click(screen.getByLabelText('Add field'));
    await user.type(screen.getByPlaceholderText('e.g. Brand'), ' Brand ');
    await user.type(
      screen.getByPlaceholderText('e.g. your brand'),
      ' Benchmade '
    );
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmitSpy).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        name: 'Knife',
        imageData: image,
        customFields: [{ name: 'Brand', value: 'Benchmade' }]
      })
    );
    expect(closeSpy).toHaveBeenCalledOnce();
  });

  it('submits an existing item without custom fields', async () => {
    const user = userEvent.setup();
    const closeSpy = vi.fn();
    const onSubmitSpy = vi.fn();

    renderWithContext(
      <CarryItemModal
        carryItem={{
          id: 'item-1',
          name: 'Knife',
          carryCount: 5,
          createdAt: '2026-01-01T12:00:00.000Z',
          color: '#0000ff',
          imageData: new File(['image'], 'knife.png', { type: 'image/png' }),
          customFields: undefined
        }}
        customFieldsValueMap={{}}
        opened
        close={closeSpy}
        onSubmit={onSubmitSpy}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmitSpy).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ customFields: undefined })
    );
    expect(closeSpy).toHaveBeenCalledOnce();
  });
});
