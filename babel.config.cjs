// @ts-ignore
const {getBabelConfig} = require('ocular-dev-tools/configuration');

module.exports = getBabelConfig({
  react: true,
  plugins: [
    // inject __VERSION__ from package.json
    'version-inline'
  ],
  ignore: [
    // Don't transpile workers, they are transpiled separately
    '**/*.worker.js',
    '**/workers/*.js',
    // Don't transpile files in libs, we use this folder to store external,
    // already transpiled and minified libraries and scripts.
    // e.g. draco, basis, las-perf etc.
    /src\/libs/,
    // babel can't process .d.ts
    /\.d\.ts$/
  ],
  debug: false
});
