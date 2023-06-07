export function clampNumber(number: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, number));
}

export function nearestNumber(number: number, granularity: number) {
    return Math.round(number / granularity) * granularity;
}
