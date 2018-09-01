module.exports = {
  entry: __dirname + '/src/index.js',
  output: {
    path: __dirname + '/',
    publicPath: '/',
    filename: 'bundle.js'
  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }]
  }
};
