var webpack = require('webpack');
var path = require('path');

var srcPath = path.join(__dirname, '/src');
var libPath = path.join(__dirname, '/lib');

module.exports = {
  context: srcPath,

  entry: {
    core: './core/index.js',
  },

  output: {
    path: libPath,
    filename: 'yve.[name].js',
    libraryTarget: 'var',
    library: 'YveBot'
  },

  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
    ],
  },
};
