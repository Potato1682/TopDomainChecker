module.exports = {
    verbose: true,
    moduleFileExtensions: [
        "ts",
        "js"
    ],
    transform: {
        "^.+\\.ts$": "ts-jest"
    },
    globals: {
        "ts-jest": {
            tsconfig: "tsconfig.json"
        }
    },
    testMatch: [
        "**/test/**/*.test.ts"
    ],
    reporters: [
        "default",
        "jest-github-actions-reporter"
    ],
    testLocationInResults: true,
    coverage: true
};
