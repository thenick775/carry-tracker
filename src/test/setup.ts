import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import 'fake-indexeddb/auto';
import { afterEach, vi } from 'vitest';

dayjs.extend(isBetween);
dayjs.extend(utc);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

class ResizeObserver {
  public observe = vi.fn();

  public unobserve = vi.fn();

  public disconnect = vi.fn();
}

vi.stubGlobal('ResizeObserver', ResizeObserver);

Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: vi.fn()
});

Object.defineProperty(URL, 'createObjectURL', {
  configurable: true,
  writable: true,
  value: vi.fn(() => 'blob:mock-url')
});

Object.defineProperty(URL, 'revokeObjectURL', {
  configurable: true,
  writable: true,
  value: vi.fn()
});

afterEach(() => {
  cleanup();
});
