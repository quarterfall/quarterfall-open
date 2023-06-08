const fs = require("fs");

function walk(options) {
    const { dir, extension } = options;
    let results = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = dir + "/" + file;

        var stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            /* Recurse into a subdirectory */
            results = results.concat(walk({ dir: filePath, extension }));
        } else {
            /* Is a file, add it if the extension matches */
            if (!extension || filePath.endsWith(extension)) {
                results.push(filePath);
            }
        }
    }
    return results;
}

function getTranslationStrings(filepath) {
    let contents = fs.readFileSync(filepath, "utf-8");
    if (contents === "") {
        return [];
    }
    contents = contents.replace(/(\r\n|\n|\r|\t)/gm, "");

    const matches =
        contents.match(
            /[^A-Za-z0-9][t][(][ ]*[\"\`][A-Za-z0-9: .${}_+-=!?\[\]\(\)\|]+[\"\`]/g
        ) || [];

    return matches.map((s) => s.split(/['"`]/)[1]);
}

function getAllTranslationStrings() {
    const pagesFiles = walk({ dir: "pages", extension: "tsx" });
    const files = walk({ dir: "src", extension: "tsx" }).concat(pagesFiles);

    let allStrings = [];

    for (const file of files) {
        const strings = getTranslationStrings(file);
        allStrings = allStrings.concat(...strings);
    }
    return Array.from(new Set(allStrings));
}

module.exports = {
    walk,
    getTranslationStrings,
    getAllTranslationStrings,
};
