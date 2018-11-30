const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const envFlag = process.env.NODE_ENV === 'production'
const html = [];
const ens = fs.readdirSync(__dirname).reduce((entries, dir) => {
  const fullDir = path.join(__dirname, dir)
  if (fs.statSync(fullDir).isDirectory) {
    const entry = path.join(fullDir, 'app.js')
    if (fs.existsSync(entry)) {
      entries[dir] = ['babel-polyfill', 'webpack-hot-middleware/client', entry]  //热部署
      html.push({
        filename: `${dir}.html`,
        template: path.join(fullDir, 'index.html'),
        chunks: [dir]
      })
    }
  }
  return entries
}, {})

const htmlPlugins = html.map((item, i) => {
  return new HtmlWebpackPlugin({
    filename: item.filename,
    template: item.template,
    chunks: item.chunks,    //这个chunks要和entry中的相同
    inject: false
  })
})

module.exports = {
  entry: {
    ...ens,
    vendor: ['vue', 'vuex', 'vue-router', 'lodash']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),   // 线上可以更换目录
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
    publicPath: '/dist/'
  },
  module: {
    rules: [
      // { test: /\.html$/, use: ['file-loader'] },    //使用该loader会修改html的内容
      { test: /\.js$/, exclude: /node_modules/, use: ['babel-loader'] },
      { test: /\.vue$/, use: ['vue-loader'] },
      { test: /\.css$/, use: ['vue-style-loader', 'css-loader'] },
      {
        test: /\.(scss|sass)$/,
        use: ['vue-style-loader', {  // style-loader用来将css加入到dom中 add css to the dom by injecting a <style> tag
          loader: 'css-loader',  // css-loader用来提取import, require中的css
          options: {
            extract: envFlag,
            sourceMap: envFlag
          }
        }, {
            loader: 'postcss-loader',
            options: {
              sourceMap: envFlag
            }
          },
          {
            loader: 'sass-loader',   // 将 sass/scss文件转位css
            options: {
              // indentedSyntax: true,
              sourceMap: envFlag
            }
          }]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1000,
          name: '[hash:7].[ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[hash:7].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[hash:7].[ext]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.vue', '.js', '.json', '.css', '.scss'],
    alias: {
      '@': path.resolve('.')
    }
  },
  optimization: {
    minimize: false,  //生产环境默认的是true, 所以会压缩js
    /* minimizer属性允许你覆盖默认的minimize， 使用自己配置的压缩方式
    minimizer: [
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: false,
        compressor: {
          warnings: false
        },
        mangle: {
          except: [] // 设置不混淆变量名
        }
      })
    ]*/
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: 'vendor',    // entry中需要split的代码, 提起css时， css的[name],就是这个
          // reuseExistingChunk: true,
          filename: 'vendor.js',
          chunks: 'initial',
          // minChunks: 3
        }
      }
    }
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // new HtmlWebpackPlugin({
    //   filename: 'index.html',
    //   template: path.join(__dirname, 'public', 'index.html'),
    //   chunks: ['app', 'main', 'vendor'],    //这个chunks要和entry中的相同
    //   // inject: 'body'
    // }),
    //webpack4在使用eslint时，会报错Module build failed (from ./node_modules/eslint-loader/index.js):
    // 需要使用该插件，让loader在__dirname下去寻找module
    new webpack.LoaderOptionsPlugin(
      {
        // minimize: true,    //是否压缩loader提取的内容
        debug: true,
        options: {
          context: __dirname
        }
      }
    )
  ].concat(htmlPlugins),
  performance: {
    // hints: envFlag ? false : 'warning', // 如果超过最大体积，是否提示warning
    maxAssetSize: 1000000   // 1M
  }
}