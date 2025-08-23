module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "quotes": ["error", "double"],
    "max-len": ["error", {"code": 120}], // Increased from 80 to 120
    "object-curly-spacing": ["error", "never"],
    "indent": ["error", 2],
  },
};
