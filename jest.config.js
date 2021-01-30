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
        "**/tests/**/*.test.ts"
    ],
    reporters: [
        "default",
        "jest-github-actions-reporter"
    ],
    testLocationInResults: true,
    setupFilesAfterEnv: [
        process.cwd() + "/jest.setup.js"
    ]
};
