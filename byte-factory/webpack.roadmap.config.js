const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const createConfig = require('./webpack.config');

// Reuse the existing TypeScript/CSS setup with a separate preview page.
module.exports = (env, argv) => {
  const config = createConfig(env, argv);
  config.entry = './src/screens/roadmap-preview.ts';
  config.output.path = path.resolve(__dirname, 'build/roadmap-preview');
  config.plugins = [
    new HtmlWebpackPlugin({template: 'src/screens/roadmap-preview.html'}),
  ];
  config.devServer = {static: false, port: 8081};
  return config;
};
