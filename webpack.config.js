const path = require('path'),
  glob = require('glob'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  ImageMinimizerPlugin = require('image-minimizer-webpack-plugin'),
  TerserPlugin = require('terser-webpack-plugin'),
  webpack = require('webpack');

let mode = 'development',
  target = 'web',
  debug;

switch (process.env.NODE_ENV) {
  case 'production':
    mode = 'production';
    target = 'browserslist';
    break;

  case 'debug':
    target = 'browserslist';
    debug = true;
    break;
}

let plugins = [
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
  }),
  new MiniCssExtractPlugin({
    filename: 'css/[name].[contenthash].css',
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: './app/assets',
        to: './assets',
        noErrorOnMissing: true,
      },
    ],
  }),
];
MultiplePages(glob.sync('./app/pug/*.pug'));

function MultiplePages(paths) {
  for (const html of paths) {
    let split = html.split('/'),
      outName = split[split.length - 1];
    outName = outName.split('.')[0];
    plugins.push(
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, html),
        filename: `${outName}.html`,
        hash: true,
        minify: false,
        inject: 'body',
      })
    );
  }
}

module.exports = {
  entry: {
    index: path.resolve(__dirname, './app/js/index.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash].js',
    clean: true,
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  devServer: {
    open: '/',
    watchFiles: ['app/pug/**/*'],
    host: 'local-ip',
    port: 1200,
  },
  mode: mode,
  target: target,
  devtool: 'source-map',
  plugins: plugins,
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: 'commons',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
        },
      },
    },
    minimizer: [
      // Сжатие изображений
      new ImageMinimizerPlugin({
        test: /\.(jpg|jpeg|gif|png|svg)$/i,
        exclude: /node_modules/,
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ['gifsicle', { interlaced: true, optimizationLevel: 3 }],
              ['mozjpeg', { progressive: true, quality: 70 }],
              ['pngquant', { quality: [0.6, 0.8] }],
              [
                'svgo',
                {
                  plugins: [
                    {
                      name: 'preset-default',
                      params: {
                        overrides: {
                          removeViewBox: false,
                          sortDefsChildren: false,
                          mergePaths: false,
                          moveGroupAttrsToElems: false,
                          moveElemsAttrsToGroup: false,
                          cleanupNumericValues: false,
                          removeNonInheritableGroupAttrs: false,
                          convertTransform: false,
                          cleanupEnableBackground: false,
                        },
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),

      // Сжатие Webp
      new ImageMinimizerPlugin({
        test: /\.(png|jpe?g|webp|gif)$/i,
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [['webp', { quality: 75 }]],
          },
        },
      }),

      // Минификация JS
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
        extractComments: false,
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        enforce: 'pre',
        loader: 'webpack-glob-loader'
      },
      {
        test: /\.s[ac]ss$/i,
        enforce: 'pre',
        use: [
          { loader: 'webpack-glob-loader' }
        ]
      },
      // Pug
      {
        test: /\.pug$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'pug-loader',
        options: {
          pretty: true,
        },
      },
      // CSS
      {
        test: /\.(sass|scss|css)$/,
        use: [
          mode === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
          mode === 'production' || debug
            ? {
                loader: 'postcss-loader',
                options: {
                  postcssOptions: {
                    plugins: [
                      [
                        'postcss-preset-env',
                        {
                          // Options
                        },
                      ],
                    ],
                  },
                },
              }
            : undefined,
          'sass-loader',
        ].filter((x) => x !== undefined),
      },
      // JavaScript
      mode === 'production' || debug
        ? {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
              },
            },
          }
        : undefined,
    ].filter((x) => x !== undefined),
  },
};
