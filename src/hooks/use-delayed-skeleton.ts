import { useTimeout } from '@mantine/hooks';
import { useState } from 'react';

export const useDelayedSkeleton = (delayMs = 50) => {
  const [showSkeleton, setShowSkeleton] = useState(false);
  useTimeout(() => setShowSkeleton(true), delayMs, {
    autoInvoke: true
  });

  return showSkeleton;
};
