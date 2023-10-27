module.exports = {
  extends: [
    'standard',
    'standard-react',
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
  ],
  rules: {
    'multiline-ternary': 'off',
    camelcase: 0,
    'no-empty': ['off', { allowEmptyCatch: true }],
    indent: [
      'error',
      2,
      {
        // ignoredNodes: ['JSXAttribute', 'JSXSpreadAttribute']
      }
    ],
    'react/jsx-indent': [0, 2],
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    semi: 0,
    'react/no-unused-prop-types': 0,
    'react/display-name': ['off', { ignoreTranspilerName: false }],
    'react/prop-types': 0,
    'generator-star-spacing': [
      'error',
      {
        before: false,
        after: true
      }
    ],
    'comma-dangle': ['error', 'only-multiline'],
    'import/no-named-default': 0,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/explicit-module-boundary-types': 'off'
  },

}
