const alias = require('./alias')

module.exports = {
  root: true,
  extends: ['airbnb-base', 'loose-airbnb'],
  env: {
    browser: true,
    node: true,
    jest: true,
    es6: true,
    webextensions: true
  },
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
    ecmaFeatures: {
      classes: true,
      modules: true
    }
  },
  // plugins: ["react-hooks"],
  rules: {
    semi: ['warn', 'never'],
    // 'react-hooks/rules-of-hooks': 'error',
    indent: [
      1,
      2,
      {
        SwitchCase: 1
      }
    ],
    'import/no-extraneous-dependencies': ['error',
      {
        'devDependencies': [
          'build/**',
          'postcss.config.js',
          'webpack.electron.js'
        ]
      }],
    'function-paren-newline': 0,
    'class-methods-use-this': 0,
    'prefer-object-spread': 0,
  },
  settings: {
    'import/resolver': {
      alias: {
        map: aliasListMap(alias),
        extensions: ['.ts', '.js', '.jsx']
      }
    }
  }
}

function aliasListMap(alias) {
  return Object.keys(alias).map(key => [key, alias[key]])
}
