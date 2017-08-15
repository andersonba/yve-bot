var webpack = require('webpack');
var path = require('path');
var BabiliPlugin = require('babili-webpack-plugin');

var srcPath = path.join(__dirname, '/src');
var libPath = path.join(__dirname, '/lib');

module.exports = {
  context: srcPath,

  entry: {
    core: './index.js',
  },

  output: {
    path: libPath,
    filename: 'yve.[name].js',
    library: 'YveBot',
    libraryTarget: 'umd',
  },

  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
    ],
  },

  plugins: [
    new BabiliPlugin(),
  ],
};
