export type AllowedCharacters =
    | "numbers"
    | "uppercaseLetters"
    | "lowercaseLetters";

export function generateId(
    options: {
        length?: number;
        allowed?: AllowedCharacters[];
        numbersOnly?: boolean;
        charactersOnly?: boolean;
    } = {}
): string {
    const {
        length = 20,
        allowed = ["numbers", "uppercaseLetters", "lowercaseLetters"],
    } = options;

    const charSets = {
        numbers: "0123456789",
        uppercaseLetters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        lowercaseLetters: "abcdefghijklmnopqrstuvwxyz",
    };

    const chars = allowed.map((value) => charSets[value]).join("");

    let str = "";
    for (let i = 0; i < length; i += 1) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}
