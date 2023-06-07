const fs = require("fs");
const path = require("path");
const { getAllTranslationStrings } = require("./analyze");
const colors = require("colors");

let stringsFromSrc = getAllTranslationStrings();

// filter out strings containing accolades
stringsFromSrc.filter((s) => !s.includes("{"));
const fullTranslationsStrings = [];

// construct the list of json files to process
const directoryPath = path.join(__dirname, "../");
const files = fs.readdirSync(directoryPath).filter((f) => f.endsWith(".json"));

for (const file of files) {
    // extract the namespace
    const namespace = file.split(".")[0];
    // read the translations from the file
    const filePath = path.join(__dirname, `../${file}`);
    const fileData = JSON.parse(fs.readFileSync(filePath));
    const translationKeys = Object.keys(fileData);

    // construct the json data per locale
    locales = {};
    for (const key of translationKeys) {
        const entry = fileData[key];
        const localeKeys = Object.keys(entry);
        if (!localeKeys.includes("en") || !localeKeys.includes("nl")) {
            continue;
        }
        // store the values
        for (const localeKey of localeKeys) {
            if (localeKey.startsWith("_")) {
                continue;
            }
            locales[localeKey] = locales[localeKey] || {};
            // now store the locale value
            locales[localeKey][key] = entry[localeKey];
        }
        // keep track of the full translation string
        if (namespace !== "common") {
            fullTranslationsStrings.push(`${namespace}:${key}`);
        } else {
            fullTranslationsStrings.push(key);
        }
    }

    const localeKeys = Object.keys(locales);
    for (const localeKey of localeKeys) {
        const path = `public/locales/${localeKey}`;
        const filename = `${path}/${file}`;
        fs.mkdirSync(path, { recursive: true });
        fs.writeFileSync(filename, JSON.stringify(locales[localeKey]));
    }
}

console.log(colors.gray(`Processed translations: ${files}`));

// now verify the completeness of the translation set
const missingTranslations = stringsFromSrc.filter(
    (s) =>
        fullTranslationsStrings.indexOf(s) < 0 &&
        fullTranslationsStrings.indexOf(`${s}_one`) < 0
);
const possiblyMissing = missingTranslations.filter((s) => s.indexOf("$") >= 0);
const percentageCompleted = Math.floor(
    100 -
        ((missingTranslations.length - possiblyMissing.length) /
            stringsFromSrc.length) *
            100
);

if (percentageCompleted < 100) {
    console.log(colors.red(`${percentageCompleted}% translations available.`));
} else {
    console.log(
        colors.green(`${percentageCompleted}% translations available.`)
    );
}

// print out the missing translations
for (const missing of missingTranslations) {
    if (possiblyMissing.indexOf(missing) < 0) {
        console.log(colors.yellow(`Missing translation: ${missing}`));
    }
}

for (const missing of possiblyMissing) {
    console.log(colors.blue(`Possibly missing translation: ${missing}`));
}
