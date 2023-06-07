import { useState } from "react";

export function useLocalStorage<T = string>(
    key: string,
    initialValue?: T
): [T, (value: T) => void] {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            if (typeof localStorage === "undefined") {
                return initialValue;
            }
            // Get from local storage by key
            const item = localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // If error also return initialValue
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value: T) => {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
            value instanceof Function ? value(storedValue) : value;
        // Save state
        setStoredValue(valueToStore);
        // Save to local storage if possible
        if (typeof localStorage !== "undefined") {
            localStorage.setItem(key, JSON.stringify(valueToStore));
        }
    };

    return [storedValue, setValue];
}
