const gulpfile = require('@lead-management/gulp');
const { name } = require('./package.json');

gulpfile({
  name,
  entry: 'src/index.js',
  lintPaths: ['src/**/*.js'],
  watchPaths: [
    'src/**/*.js',
  ],
});
