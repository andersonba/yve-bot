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

  onwarn({ code, message }) {
    if (
      // Suppress known error message caused by TypeScript compiled code with Rollup
      // https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
      code === 'THIS_IS_UNDEFINED'
    ) { return; }
    console.log(`Rollup warning: ${message}`); // tslint:disable-line
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
    format: 'iife',
    name: 'YveBot',
  },
};

export default [
  client,
  server,
];
