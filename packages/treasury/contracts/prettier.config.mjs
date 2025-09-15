export default {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  quoteProps: 'as-needed',
  jsxSingleQuote: true,
  plugins: ['prettier-plugin-solidity'],
  overrides: [
    {
      files: '*.sol',
      options: {
        tabWidth: 4,
        printWidth: 120,
        singleQuote: false,
        semi: false,
        compiler: '0.8.18',
      },
    },
    {
      files: '*.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
        parser: 'json',
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'preserve',
        tabWidth: 2,
      },
    },
    {
      files: '*.yml',
      options: {
        printWidth: 120,
        tabWidth: 2,
        singleQuote: true,
      },
    },
    {
      files: '*.yaml',
      options: {
        printWidth: 120,
        tabWidth: 2,
        singleQuote: true,
      },
    },
  ],
};