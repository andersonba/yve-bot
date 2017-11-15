import fs from 'fs';
import path from 'path';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import uglify from 'rollup-plugin-uglify';

function onwarn(warning, warn) {
  if (warning.code === 'THIS_IS_UNDEFINED') { return; }
  warn(warning);
}

const server = {
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

const client = {
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
    file: 'lib/ui.js',
    format: 'umd',
    name: 'YveBot',
  },
};

const typeFiles = fs.readdirSync('./src/ext/types')
  .filter((t) => /\.ts$/.test(t))
  .map((t) => t.split('.')[0]);

const typeExtensions = typeFiles.map((eType) => {
  const src = path.resolve('./src/core/index.ts');
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
      src,
      'isomorphic-unfetch',
    ],

    globals: {
      [src]: 'YveBot',
    },

    output: {
      file: `lib/ext/types/${eType}.js`,
      format: 'umd',
      name: `YveBotTypes${eType}`,
      paths: {
        [src]: '../../core',
      },
    },

    onwarn,
  };
});

export default [
  client,
  server,
  ...typeExtensions,
];
