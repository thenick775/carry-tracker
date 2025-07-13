import { useState, useEffect } from 'preact/hooks';

export const useObjectUrl = (blob?: File) => {
  const [objectUrl, setObjectUrl] = useState<string>();

  useEffect(() => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    setObjectUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [blob]);

  return objectUrl;
};
