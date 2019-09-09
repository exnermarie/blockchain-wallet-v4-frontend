/* eslint-disable */
const chalk = require('chalk')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const Webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const PATHS = require('./config/paths')
const mockWalletOptions = require('./config/mocks/wallet-options-v4.json')

const mainProcessBabelConfig = require(`./packages/main-process/babel.config`)
const securityProcessBabelConfig = require(`./packages/security-process/babel.config`)

let envConfig = {}
let manifestCacheBust = new Date().getTime()
let sslEnabled = process.env.DISABLE_SSL
  ? false
  : fs.existsSync(PATHS.sslConfig + '/key.pem') &&
    fs.existsSync(PATHS.sslConfig + '/cert.pem')
let localhostUrl = sslEnabled
  ? 'https://localhost:8080'
  : 'http://localhost:8080'

try {
  envConfig = require(PATHS.envConfig + `/${process.env.NODE_ENV}` + '.js')
} catch (e) {
  console.log(
    chalk.red('\u{1F6A8} WARNING \u{1F6A8} ') +
      chalk.yellow(
        `Failed to load ${
          process.env.NODE_ENV
        }.js config file! Using the production config instead.\n`
      )
  )
  envConfig = require(PATHS.envConfig + '/production.js')
} finally {
  console.log(chalk.blue('\u{1F6A7} CONFIGURATION \u{1F6A7}'))
  console.log(chalk.cyan('Root URL') + `: ${envConfig.ROOT_URL}`)
  console.log(chalk.cyan('API Domain') + `: ${envConfig.API_DOMAIN}`)
  console.log(
    chalk.cyan('Wallet Helper Domain') +
      ': ' +
      chalk.blue(envConfig.WALLET_HELPER_DOMAIN)
  )
  console.log(
    chalk.cyan('Web Socket URL') + ': ' + chalk.blue(envConfig.WEB_SOCKET_URL)
  )
  console.log(chalk.cyan('SSL Enabled: ') + chalk.blue(sslEnabled))
}

module.exports = {
  mode: 'development',
  node: {
    fs: 'empty'
  },
  entry: {
    index: [
      '@babel/polyfill',
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://localhost:8080',
      'webpack/hot/only-dev-server',
      './packages/root-process/src/index.js'
    ],
    main: [
      '@babel/polyfill',
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://localhost:8080',
      'webpack/hot/only-dev-server',
      './packages/main-process/src/index.js'
    ],
    security: [
      '@babel/polyfill',
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://localhost:8080',
      'webpack/hot/only-dev-server',
      './packages/security-process/src/index.js'
    ]
  },
  output: {
    path: PATHS.appBuild,
    chunkFilename: '[name].[chunkhash:10].js',
    publicPath: '/',
    crossOriginLoading: 'anonymous'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, `packages/security-process/src`),
        use: [
          { loader: 'thread-loader', options: { workerParallelJobs: 50 } },
          {
            loader: 'babel-loader',
            options: securityProcessBabelConfig(
              null,
              `./packages/security-process`
            )
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: [
          path.resolve(__dirname, `packages/security-process/src`),
          /\/node_modules\//
        ],
        use: [
          { loader: 'thread-loader', options: { workerParallelJobs: 50 } },
          {
            loader: 'babel-loader',
            options: mainProcessBabelConfig(null, `./packages/main-process`)
          }
        ]
      },
      {
        test: /\.(eot|ttf|otf|woff|woff2)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'fonts/[name]-[hash].[ext]'
          }
        }
      },
      {
        test: /\.(png|jpg|gif|svg|ico|webmanifest|xml)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'img/[name].[ext]'
          }
        }
      },
      {
        test: /\.(pdf)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'resources/[name]-[hash].[ext]'
          }
        }
      },
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
      }
    ]
  },
  performance: {
    hints: false
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CaseSensitivePathsPlugin(),
    new Webpack.DefinePlugin({
      APP_VERSION: JSON.stringify(require(PATHS.pkgJson).version),
      NETWORK_TYPE: JSON.stringify(envConfig.NETWORK_TYPE)
    }),
    new HtmlWebpackPlugin({
      chunks: [`index`],
      template: './packages/root-process/src/index.html',
      filename: 'index.html'
    }),
    new HtmlWebpackPlugin({
      chunks: [`main`],
      template: './packages/main-process/src/index.html',
      filename: 'main.html'
    }),
    new HtmlWebpackPlugin({
      chunks: [`security`],
      template: './packages/security-process/src/index.html',
      filename: 'security.html'
    }),
    new Webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }),
    new Webpack.HotModuleReplacementPlugin()
  ],
  optimization: {
    namedModules: true,
    concatenateModules: false,
    runtimeChunk: {
      name: `manifest.${manifestCacheBust}`
    }
  },
  devServer: {
    cert: sslEnabled
      ? fs.readFileSync(PATHS.sslConfig + '/cert.pem', 'utf8')
      : '',
    contentBase: PATHS.src,
    disableHostCheck: true,
    host: 'localhost',
    https: sslEnabled,
    key: sslEnabled
      ? fs.readFileSync(PATHS.sslConfig + '/key.pem', 'utf8')
      : '',
    port: 8080,
    hot: true,
    historyApiFallback: true,
    before(app) {
      app.get('/Resources/wallet-options-v4.json', function(req, res) {
        // combine wallet options base with custom environment config
        mockWalletOptions.domains = {
          api: envConfig.API_DOMAIN,
          coinify: envConfig.COINIFY_URL,
          coinifyPaymentDomain: envConfig.COINIFY_PAYMENT_DOMAIN,
          comRoot: envConfig.COM_ROOT,
          comWalletApp: envConfig.COM_WALLET_APP,
          horizon: envConfig.HORIZON_URL,
          ledger: localhostUrl + '/ledger', // will trigger reverse proxy
          ledgerSocket: envConfig.LEDGER_SOCKET_URL,
          root: envConfig.ROOT_URL,
          thePit: envConfig.THE_PIT_URL,
          veriff: envConfig.VERIFF_URL,
          walletHelper: envConfig.WALLET_HELPER_DOMAIN,
          webSocket: envConfig.WEB_SOCKET_URL
        }

        if (process.env.NODE_ENV === 'testnet') {
          mockWalletOptions.platforms.web.coins.BTC.config.network = 'testnet'
          mockWalletOptions.platforms.web.coinify.config.partnerId = 35
          mockWalletOptions.platforms.web.sfox.config.apiKey =
            '6fbfb80536564af8bbedb7e3be4ec439'
        }

        res.json(mockWalletOptions)
      })

      // TODO: DEPRECATE
      // This is to locally test transferring cookies from transfer_stored_values.html
      app.get('/Resources/transfer_stored_values.html', function(req, res) {
        res.sendFile(
          path.join(
            __dirname,
            '/../../config/mocks/transfer_stored_values.html'
          )
        )
      })

      app.get('/Resources/wallet-options.json', function(req, res) {
        mockWalletOptions.domains = { comWalletApp: localhostUrl }
        res.json(mockWalletOptions)
      })
    },
    proxy: {
      '/ledger': {
        target: envConfig.LEDGER_URL,
        secure: false,
        changeOrigin: true,
        pathRewrite: { '^/ledger': '' }
      }
    },
    overlay: {
      warnings: true,
      errors: true
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Security-Policy': [
        `img-src ${localhostUrl} data: blob:`,
        `script-src ${localhostUrl} 'unsafe-eval'`,
        `style-src ${localhostUrl} 'unsafe-inline'`,
        `frame-src ${envConfig.COINIFY_PAYMENT_DOMAIN} ${
          envConfig.WALLET_HELPER_DOMAIN
        } ${envConfig.ROOT_URL} https://magic.veriff.me ${localhostUrl}`,
        `child-src ${envConfig.COINIFY_PAYMENT_DOMAIN} ${
          envConfig.WALLET_HELPER_DOMAIN
        } blob:`,
        [
          'connect-src',
          localhostUrl,
          'ws://localhost:8080',
          'wss://localhost:8080',
          'wss://api.ledgerwallet.com',
          'wss://ws.testnet.blockchain.info/inv',
          envConfig.WEB_SOCKET_URL,
          envConfig.ROOT_URL,
          envConfig.API_DOMAIN,
          envConfig.WALLET_HELPER_DOMAIN,
          envConfig.LEDGER_URL,
          envConfig.LEDGER_SOCKET_URL,
          envConfig.HORIZON_URL,
          envConfig.VERIFF_URL,
          'https://friendbot.stellar.org',
          'https://app-api.coinify.com',
          'https://app-api.sandbox.coinify.com',
          'https://api.sfox.com',
          'https://api.staging.sfox.com',
          'https://quotes.sfox.com',
          `https://quotes.staging.sfox.com`,
          'https://sfox-kyc.s3.amazonaws.com',
          'https://sfox-kyctest.s3.amazonaws.com',
          'https://testnet5.blockchain.info',
          'https://api.testnet.blockchain.info',
          'https://shapeshift.io'
        ].join(' '),
        "object-src 'none'",
        `media-src ${localhostUrl} https://storage.googleapis.com/bc_public_assets/ data: mediastream: blob:`,
        `font-src ${localhostUrl}`
      ].join('; ')
    }
  }
}