import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
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

  external: [
    'isomorphic-unfetch',
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
      preferBuiltins: false,
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

export default [
  client,
  server,
];
