import { rollup } from 'rollup';
import fs from 'fs';
import path from 'path';
import analyzer from 'rollup-analyzer';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';

const corePath = path.resolve('./src/core/index.ts');

function onwarn(warning, warn) {
  if (warning.code === 'THIS_IS_UNDEFINED') { return; }
  warn(warning);
}

const core = {
  input: 'src/core/index.ts',

  plugins: [
    typescript(),
    commonjs(),
    resolve(),
    json(),
    uglify(),
  ],

  output: {
    file: 'lib/core.js',
    format: 'umd',
    name: 'YveBot',
  },

  onwarn,
};

const ui = {
  input: 'src/ui/index.ts',

  plugins: [
    typescript(),
    commonjs(),
    resolve(),
    json(),
    uglify(),
  ],

  external: [
    corePath,
  ],

  output: {
    file: 'lib/ui.js',
    format: 'umd',
    name: 'YveBot',
    paths: {
      [corePath]: './core',
    },
    globals: {
      [corePath]: 'YveBot',
    },
  },
};

const web = {
  input: 'src/ui/index.ts',

  context: 'window',

  plugins: [
    typescript(),
    commonjs(),
    resolve({
      browser: true,
    }),
    json(),
    uglify(),
  ],

  output: {
    file: 'lib/web.js',
    format: 'umd',
    name: 'YveBot',
  },
};

const typeFiles = fs.readdirSync('./src/ext/types')
  .filter((t) => /\.ts$/.test(t))
  .map((t) => t.split('.')[0]);

const typeExtensions = typeFiles.map((eType) => {
  return {
    input: `src/ext/types/${eType}.ts`,

    plugins: [
      typescript(),
      commonjs(),
      resolve(),
      json(),
      uglify(),
    ],

    external: [
      corePath,
      'isomorphic-unfetch',
    ],

    output: {
      file: `lib/ext/types/${eType}.js`,
      format: 'umd',
      name: `YveBotTypes${eType}`,
      paths: {
        [corePath]: '../../core',
      },
      globals: {
        [corePath]: 'YveBot',
      },
    },

    onwarn,
  };
});

const bundles = [core, ui, web, ...typeExtensions];

if (process.env.BUNDLE_ANALYZER) {
  bundles.forEach((bundle) =>
    rollup(bundle).then((output) => {
      console.log(`BUNDLE: ${bundle.input}`);
      analyzer({ limit: 5 }).formatted(output)
        .then((out) => console.log(out, '\n\n\n\n'))
        .catch(console.error);
    }));
}

export default bundles;
