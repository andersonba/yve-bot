const merge = require('lodash/merge');
const path = require('path');
const webpack = require('webpack');

const { CheckerPlugin } = require('awesome-typescript-loader')

const srcPath = path.join(__dirname, '/src');
const libPath = path.join(__dirname, '/lib');

const nodeExternals = require('webpack-node-externals');


const baseConfig = {
  context: srcPath,
  output: {
    path: libPath,
    filename: 'yve-bot.[name].js',
    library: 'YveBot',
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
    /*
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
    }),
    */
  ],
};

const server = merge({}, baseConfig, {
  target: 'node',
  externals: [nodeExternals()],
  entry: {
    core: './core/index.ts'
  },

  output: {
    libraryTarget: 'commonjs2',
  },
});

const browser = merge({}, baseConfig, {
  entry: {
    ui: './ui/index.ts'
  },

  output: {
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
});

module.exports = [ server, browser ];
