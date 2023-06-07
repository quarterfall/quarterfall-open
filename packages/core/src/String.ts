export function addNumberToString(str: string): string {
    let result = str;
    let nr = 1;
    // add a number between parentheses
    const regExp = /\(([^)]+)\)/;
    const matches = regExp.exec(str);
    if (matches && matches.length > 1) {
        const nrConverted = Number(matches[1]);
        if (!isNaN(nrConverted)) {
            // remove the number from the string
            result = result.replace(matches[0], "").trimRight();
            nr = nrConverted + 1;
        }
    }

    result += ` (${nr})`;

    return result;
}

export function ellipsis(str: string, maxLength = 20): string {
    if (str.length > maxLength) {
        return str.substring(0, maxLength - 3) + "...";
    } else {
        return str;
    }
}

export function replaceQuotes(str: string) {
    return str.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
}
