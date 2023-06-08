type SearchStringGenerator = (input: string) => string;

export const generators: SearchStringGenerator[] = [
    /** Finds words and separates them with spaces */
    function spaceWords(input: string) {
        const result = input.replace(/(^|\b)\W+(\b|$)/g, " ");
        return result !== input ? result : "";
    },

    /** Simplifies to alphanumeric (no spaces) */
    function alphanumeric(input: string) {
        const result = input.replace(/\W/g, "");
        return result !== input ? result : "";
    },

    /** Removes any kind of quotemarks */
    function quotemarks(input: string) {
        const re = /['‘’"“”]/g;
        if (!re.test(input)) {
            return "";
        }
        return input.replace(re, "");
    },

    /** Removes 's */
    function apostropheS(input: string) {
        const re = /['‘’]s/g;
        if (!re.test(input)) {
            return "";
        }
        return input.replace(re, "");
    },

    /** Expands 't abbreviation */
    function apostropheT(input: string) {
        const re = /['‘’]t/g;
        if (!re.test(input)) {
            return "";
        }
        return [input.replace(re, ""), input.replace(re, "het")].join(" ");
    },

    /** Expands 'n abbreviation */
    function apostropheN(input: string) {
        const re = /['‘’]n/g;
        if (!re.test(input)) {
            return "";
        }
        return [
            input.replace(re, ""),
            input.replace(re, "een"),
            input.replace(re, "and")
        ].join(" ");
    },

    /** Expands ampersands to full words */
    function ampersand(input: string) {
        const re = / ?& ?/g;
        if (!re.test(input)) {
            return "";
        }
        return [
            input.replace(re, " "),
            input.replace(re, " en "),
            input.replace(re, " and ")
        ].join(" ");
    }
];
