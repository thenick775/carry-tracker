import { useState, useLayoutEffect, useRef } from 'react';

export const useObjectUrls = (files?: File[]) => {
  const [objectUrls, setObjectUrls] = useState<string[]>();
  const objectUrlsRef = useRef<string[]>([]);

  useLayoutEffect(() => {
    if (!files) return;

    objectUrlsRef.current = files.map((file) => URL.createObjectURL(file));
    setObjectUrls(objectUrlsRef.current);

    return () => {
      objectUrlsRef.current.map((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  return objectUrls;
};
