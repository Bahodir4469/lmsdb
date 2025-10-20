module.exports = {
  env: {
    node: true, // 👈 BUNI ALBATTA QO‘Y
    commonjs: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {}
};
