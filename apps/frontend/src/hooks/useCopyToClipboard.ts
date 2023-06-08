import copy from "copy-to-clipboard";
import { useCallback } from "react";

export function useCopyToClipboard() {
    return useCallback((text: string | number) => {
        if (typeof text === "string" || typeof text === "number") {
            copy(text.toString());
        } else {
            throw new Error(
                `Cannot copy typeof ${typeof text} to clipboard, must be a string or number.`
            );
        }
    }, []);
}
