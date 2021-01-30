module.exports = {
    env: {
        es6: true,
        node: true,
        jest: true
    },
    plugins: [
        "import",
        "json",
        "node",
        "unicorn"
    ],
    settings: {
        "import/resolver": {
            node: {
                extensions: [
                    ".js",
                    ".jsx",
                    ".json",
                    ".ts",
                    ".tsx"
                ]
            }
        }
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:json/recommended",
        "plugin:unicorn/recommended"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        sourceType: "module"
    },
    rules: {
        "indent": [ "error", 4, { SwitchCase: 1 }],
        "quotes": [ "error", "double" ],
        "semi": [ "error" ],
        "array-bracket-spacing": [ "error", "always", {
            singleValue: true,
            arraysInArrays: false,
            objectsInArrays: false
        }],
        "array-bracket-newline": [ "error", "consistent" ],
        "array-element-newline": [ "error", "consistent" ],
        "arrow-body-style": [ "error", "as-needed" ],
        "arrow-parens": [ "error", "as-needed", {
            requireForBlockBody: true
        }],
        "block-spacing": "error",
        "brace-style": [ "error", "1tbs" ],
        "comma-dangle": [ "error", "never" ],
        "comma-spacing": [ "error", {
            before: false,
            after: true
        }],
        "comma-style": [ "error", "last" ],
        "computed-property-spacing": [ "error", "never", {
            enforceForClassMembers: true
        }],
        "constructor-super": "error",
        curly: [ "error" ],
        "default-case-last": "error",
        "default-param-last": [ "error" ],
        "dot-notation": [ "error", {
            allowKeywords: false
        }],
        "eol-last": [ "error", "always" ],
        "for-direction": "error",
        "func-call-spacing": [ "error", "never" ],
        "func-style": [ "error", "expression" ],
        "function-paren-newline": [ "error", "multiline" ],
        "implicit-arrow-linebreak": [ "error", "beside" ],
        "key-spacing": [ "error", {
            mode: "strict"
        }],
        "keyword-spacing": [ "error", {
            before: true,
            after: true
        }],
        "no-confusing-arrow": [ "error", {
            allowParens: true
        }],
        "no-multi-assign": "error",
        "no-multi-str": "error",
        "no-nested-ternary": "off",
        "no-process-exit": "off",
        "no-return-assign": "error",
        "no-script-url": "error",
        "no-self-compare": "error",
        "no-sequences": "error",
        "no-throw-literal": "error",
        "no-unmodified-loop-condition": "error",
        "no-unused-expressions": "error",
        "no-useless-call": "error",
        "no-useless-concat": "error",
        "no-useless-return": "error",
        "no-warning-comments": "warn",
        "object-curly-spacing": [ "error", "always", {
            arraysInObjects: false,
            objectsInObjects: false
        }],
        "operator-linebreak": "error",
        "padded-blocks": [ "error", "never" ],
        "padding-line-between-statements": [ "error", {
            blankLine: "always",
            prev: [
                "block",
                "block-like"
            ],
            next: "*"
        }, {
            blankLine: "always",
            prev: "block",
            next: "export"
        }, {
            blankLine: "always",
            prev: "const",
            next: "*"
        }, {
            blankLine: "never",
            prev: "singleline-const",
            next: "singleline-const"
        }, {
            blankLine: "always",
            prev: "let",
            next: "*"
        }, {
            blankLine: "never",
            prev: "singleline-let",
            next: "singleline-let"
        }, {
            blankLine: "always",
            prev: "var",
            next: "*"
        }, {
            blankLine: "never",
            prev: "singleline-var",
            next: "singleline-var"
        }, {
            blankLine: "never",
            prev: [
                "cjs-export",
                "cjs-import"
            ],
            next: [
                "cjs-export",
                "cjs-import"
            ]
        }, {
            blankLine: "always",
            prev: "*",
            next: [
                "return",
                "continue",
                "break",
                "throw"
            ]
        }, {
            blankLine: "always",
            prev: "directive",
            next: "*"
        }, {
            blankLine: "always",
            prev: [
                "case",
                "default"
            ],
            next: "*"
        }],
        "prefer-arrow-callback": [ "error", {
            allowNamedFunctions: true
        }],
        "radix": "error",
        "require-await": "error",
        "require-yield": "error",
        "rest-spread-spacing": [ "error", "never" ],
        "space-in-parens": [ "error", "never" ],
        "space-infix-ops": "error",
        "wrap-iife": [ "error", "inside" ],
        "yoda": "error",
        "node/no-missing-import": "off",
        "import/order": "error",
        "unicorn/no-process-exit": "off"
    }
};
