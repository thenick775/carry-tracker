import { describe, expect, it, vi } from 'vitest';

import { useObjectUrls } from './use-object-urls.ts';
import { renderHook } from '../test/render-with-context.tsx';

describe('useObjectUrls', () => {
  it('returns undefined when no files are provided', () => {
    const { result } = renderHook(() => useObjectUrls());

    expect(result.current).toBeUndefined();
  });

  it('creates object urls for each provided file', () => {
    const createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValueOnce('blob:first')
      .mockReturnValueOnce('blob:second');

    const files = [
      new File(['first'], 'first.png', { type: 'image/png' }),
      new File(['second'], 'second.png', { type: 'image/png' })
    ];

    const { result } = renderHook(() => useObjectUrls(files));

    expect(result.current).toEqual(['blob:first', 'blob:second']);
    expect(createObjectURL).toHaveBeenCalledTimes(2);
  });

  it('revokes object urls on rerender and unmount', () => {
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL');

    const firstFiles = [
      new File(['first'], 'first.png', { type: 'image/png' })
    ];
    const secondFiles = [
      new File(['second'], 'second.png', { type: 'image/png' })
    ];

    const { rerender, unmount } = renderHook(
      ({ files }: { files?: File[] }) => useObjectUrls(files),
      {
        initialProps: { files: firstFiles }
      }
    );

    rerender({ files: secondFiles });
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:first');

    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:second');
  });
});
