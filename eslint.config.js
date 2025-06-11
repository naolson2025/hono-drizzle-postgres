module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'eslint:recommended', // Use the recommended rules from ESLint
    'plugin:@typescript-eslint/recommended', // Use the recommended rules from @typescript-eslint/eslint-plugin
    'plugin:@typescript-eslint/recommended-requiring-type-checking', // **Crucial for no-floating-promises**
  ],
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    tsconfigRootDir: __dirname, // Specify the root directory for tsconfig.json
    project: ['./tsconfig.json'], // Path to your tsconfig.json file
  },
  rules: {
    // Enable or customize the no-floating-promises rule
    '@typescript-eslint/no-floating-promises': 'error', // Warns for un-awaited promises
    // Add other rules or overrides as needed
  },
};
