export enum GradingSchemeOptions {
    scoreAsGrade = "scoreAsGrade",
    roundedToIntegerGrade = "roundedToInteger",
    roundedToHalvesGrade = "roundedToHalves",
    dutchGrade = "dutchGrade",
    passFailGrade = "passFailGrade",
    usLetterGrade = "usLetterGrade",
    cdLetterGrade = "cdLetterGrade",
    auLetterGrade = "auLetterGrade",
}

export const gradingSchemeDefaults = [
    {
        id: "scoreAsGrade",
        name: `${GradingSchemeOptions.scoreAsGrade}_name`,
        description: `${GradingSchemeOptions.scoreAsGrade}_description`,
        code: `return score.toString()`,
        isDefault: true,
    },
    {
        id: "roundedToIntegerGrade",
        name: `${GradingSchemeOptions.roundedToIntegerGrade}_name`,
        description: `${GradingSchemeOptions.roundedToIntegerGrade}_description`,
        code: `let result = Math.round(score/10);\nif (result < 1) result = 1;\nif (result > 10) result = 10;\nreturn result; `,
        isDefault: false,
    },
    {
        id: "roundedToHalvesGrade",
        name: `${GradingSchemeOptions.roundedToHalvesGrade}_name`,
        description: `${GradingSchemeOptions.roundedToHalvesGrade}_description`,
        code: `let result = Math.round(score/5) / 2;\nif (result < 1) result = 1;\nif (result > 10) result = 10;\nreturn result; `,
        isDefault: false,
    },
    {
        id: "dutchGrade",
        name: `${GradingSchemeOptions.dutchGrade}_name`,
        description: `${GradingSchemeOptions.dutchGrade}_description`,
        code: `let result = Math.round(score/5) / 2;\nif (result === 5.5 && score < 55) result = 5;\nif (result === 5.5 && score >= 55) result = 6;\nif (result < 1) result = 1;\nif (result > 10) result = 10;\nreturn result; `,
        isDefault: false,
    },
    {
        id: "passFailGrade",
        name: `${GradingSchemeOptions.passFailGrade}_name`,
        description: `${GradingSchemeOptions.passFailGrade}_description`,
        code: `if(score < 55) return "Failed";\nreturn "Passed";`,
        isDefault: false,
    },
    {
        id: "usLetterGrade",
        name: `${GradingSchemeOptions.usLetterGrade}_name`,
        description: `${GradingSchemeOptions.usLetterGrade}_description`,
        code: `if (score <= 59) return "F";\nif (score <= 69) return "D";\nif (score <= 79) return "C";\nif (score <= 89) return "B";\nreturn "A";`,
        isDefault: false,
    },
    {
        id: "cdLetterGrade",
        name: `${GradingSchemeOptions.cdLetterGrade}_name`,
        description: `${GradingSchemeOptions.cdLetterGrade}_description`,
        code: `if (score <= 49) return "F";\nif (score <= 54) return "D";\nif (score <= 64) return "C";\nif (score <= 79) return "B";\nif (score <= 89) return "A";\nreturn "A+";`,
        isDefault: false,
    },
    {
        id: "auLetterGrade",
        name: `${GradingSchemeOptions.auLetterGrade}_name`,
        description: `${GradingSchemeOptions.auLetterGrade}_description`,
        code: `if (score <= 49) return "N";\nif (score <= 64) return "P";\nif (score <= 74) return "C";\nif (score <= 84) return "D";\nreturn "HD";`,
        isDefault: false,
    },
];
