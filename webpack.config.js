const webpack = require('webpack');
const path = require('path');
const { CheckerPlugin } = require('awesome-typescript-loader')

const srcPath = path.join(__dirname, '/src');
const libPath = path.join(__dirname, '/lib');

module.exports = {
  context: srcPath,

  entry: {
    core: './core/index.ts',
    web: './web/index.ts',
  },

  output: {
    path: libPath,
    filename: 'yve.[name].js',
    library: 'YveBot',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  module: {
    rules: [
      { test: /\.ts$/, loader: 'tslint-loader', enforce: 'pre' },
      { test: /\.ts$/, loader: 'awesome-typescript-loader' },
    ],
  },

  plugins: [
    new CheckerPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
    }),
  ],
};
