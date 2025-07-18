import { useState, useLayoutEffect } from 'preact/hooks';

export const useObjectUrls = (files?: File[]) => {
  const [objectUrls, setObjectUrls] = useState<string[]>();

  useLayoutEffect(() => {
    if (!files) return;

    const urls = files.map((file) => URL.createObjectURL(file));
    setObjectUrls(urls);

    return () => urls.map((url) => URL.revokeObjectURL(url));
  }, [files]);

  return objectUrls;
};
