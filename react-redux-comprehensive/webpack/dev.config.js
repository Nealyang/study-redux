/**
 * Created by Nealyang on 17/3/19.
 */
const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

const WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools');

const projectRootPath = path.resolve(__dirname, '..');
const assetsPath = path.resolve(projectRootPath, 'static/dist');

const config = require('../src/config');

module.exports = {
    devtool: 'cheap-eval-source-map',
    context:projectRootPath,
    entry:[
        'webpack-hot-middleware/client?path=http://localhost:3001/__webpack_hmr',
        'bootstrap-loader',
        'font-awesome-loader!./src/theme/font-awesome/font-awesome.config.js',
        './src/client'
    ],
    output:{
        path:assetsPath,
        filename:'[name]-[hash].js',
        chunkFilename:'[name]-[chunkhash].js',
        publicPath:'http://'+config.host+':'+(config.port+1)+'/dist/'
    },
    process:true,
    plugins:[
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            __SERVER__: false
        }),
        new WebpackIsomorphicToolsPlugin(require('./webpack-isomorphic-tools')).development()
    ],
    module:{
        loaders:[
            {
                test:/\.jsx?$/,
                loader:'babel',
                exclude:/node_modules/,
                query:{
                    presets:['react-hmre']
                }
            },
            {
                test:/\.(jpeg|jpg|png|gif)$/,
                loader:'url_loader?limit=10240'
            },
            {
                test:/\.css$/,
                loaders:['style','css?modules&importLoaders=1&localIdentName=[name]__[local]__[hash:base64:5]','postcss']
            },
            {
                test:/\.scss$/,
                loaders:['style','css?modules&importLoaders=1&localIdentName=[name]__[local]__[hash:base64:5]','postcss','sass']
            },
            {
                test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url?limit=10000"
            },
            {
                test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
                loader: 'file'
            }
        ]
    },
    postcss: [autoprefixer({ browsers: ['last 2 versions'] })]
};

