import { useEffect, useRef } from "react";

export function useInterval(callback: () => void, delay: number) {
    const savedCallback = useRef(callback);

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        const id = setInterval(() => savedCallback.current(), delay);
        return () => clearInterval(id);
    }, [delay]);
}

export function useTimeout(callback: () => void, delay: number) {
    const savedCallback = useRef(callback);

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the timeout.
    useEffect(() => {
        const id = setTimeout(() => savedCallback.current(), delay);
        return () => clearTimeout(id);
    }, [delay]);
}
