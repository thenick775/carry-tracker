import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import 'fake-indexeddb/auto';
import { afterEach, vi } from 'vitest';

dayjs.extend(isBetween);
dayjs.extend(utc);

const getComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = (elt) => getComputedStyle(elt);
window.HTMLElement.prototype.scrollIntoView = () => {
  /* empty */
};

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
  public observe() {
    /* empty */
  }

  public unobserve() {
    /* empty */
  }

  public disconnect() {
    /* empty */
  }
}

window.ResizeObserver = ResizeObserver;

Object.defineProperty(document, 'fonts', {
  value: { addEventListener: vi.fn(), removeEventListener: vi.fn() }
});

Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'blob:mock-url')
});

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn()
});

afterEach(() => {
  cleanup();
});
