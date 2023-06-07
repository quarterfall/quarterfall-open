import { useEffect, useState } from "react";

export function useWindowSize() {
    const isClient = typeof window === "object";

    const [width, setWidth] = useState<number>(null);
    const [height, setHeight] = useState<number>(null);

    useEffect(() => {
        handleResize();
        if (!isClient) {
            return;
        }

        function handleResize() {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty array ensures that effect is only run on mount and unmount

    return { width, height };
}
