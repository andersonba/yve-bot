import path from 'path';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import multiEntry from 'rollup-plugin-multi-entry';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

const server = {
  input: 'compiled/core/index',

  plugins: [
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
};

const client = {
  input: 'compiled/ui/index',

  context: 'window',

  plugins: [
    commonjs(),
    resolve({
      browser: true,
    }),
    json(),
    uglify(),
  ],

  output: {
    file: 'lib/ui.js',
    format: 'umd',
    name: 'YveBot',
  },
};

const typeExtensions = ['string-search'].map((eType) => {
  const src = path.resolve('./compiled/core/index.js');
  return {
    input: `compiled/ext/types/${eType}.js`,

    plugins: [
      commonjs(),
      resolve({
        browser: true,
      }),
      json(),
      multiEntry({ exports: false }),
    ],

    external: [
      src,
      'isomorphic-unfetch',
    ],

    globals: {
      [src]: 'YveBot',
    },

    output: {
      file: `lib/ext/types/${eType}.js`,
      format: 'umd',
      paths: {
        [src]: '../../core',
      },
    },
  };
});

export default [
  client,
  server,
  ...typeExtensions,
];
