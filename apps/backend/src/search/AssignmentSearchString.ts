import { generators } from "./SearchStringGenerators";

/** Generates a search string with different versions of the assignment name */
export function createAssignmentSearchString(name: string, keywords: string[]) {
    name = name + " " + keywords.join(" ");
    const lower = name.toLowerCase().trim();
    const plain = removeDiacritics(lower);
    // Always add original and lowercase
    let result = name + " " + lower;
    if (plain !== lower) {
        result += " " + plain;
    }

    for (const generate of generators) {
        // Run generator on the plain version
        const part = generate(plain);
        if (part) {
            result += " " + part;
        }
    }

    // Remove any excess spaces
    return result.trim().replace(/\s+/g, " ");
}

function removeDiacritics(input: string) {
    // https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
    // Extract diacritic combinations
    const normalized = input.normalize("NFD");
    // Remove them using the Unicode block "Combining Diacritical Marks"
    return normalized.replace(/[\u0300-\u036f]/g, "");
}
