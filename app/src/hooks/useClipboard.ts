import { useCallback } from 'react';

export const useClipboard = () => {
    const handleCopyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text);
    }, []);
    return { handleCopyToClipboard };
};
