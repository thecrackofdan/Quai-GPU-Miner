/**
 * lint-staged configuration
 * Runs linters on git staged files
 */
module.exports = {
    '*.js': [
        'eslint --fix',
        'prettier --write'
    ],
    '*.{json,md}': [
        'prettier --write'
    ]
};

