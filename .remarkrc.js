module.exports = {
    presets: [
        "preset-recommended",
        "lint-consistent"
    ],
    plugins: [
        { "lint": { "list-item-indent": "space" }},
        "lint-blank-lines-1-0-2",
        "lint-heading-whitespace",
        "lint-match-punctuation",
        "lint-mdash-style",
        "lint-no-chinese-punctuation-in-number",
        "lint-no-dead-urls",
        "lint-no-empty-sections",
        "lint-no-url-trailing-slash",
        "lint-spaces-around-word"
    ]
};
