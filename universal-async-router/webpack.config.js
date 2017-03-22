/**
 * Created by Nealyang on 17/3/22.
 */
const path = require('path');
const webpack = require('webpack');

module.exports = {
    devtool:'cheap-eval-source-map',
    entry:[
        'webpack-hot-middleware/client',
        './client/index.js'
    ],
    output:{
        path:path.resolve(__dirname,'dist'),
        filename:'bundle.js',
        publicPath:'/static/'
    },
    plugins:[
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            __SERVER__:false
        })
    ],
    module:{
        loaders:[
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/,
                include: __dirname,
                query: {
                    presets: [ 'react-hmre' ]
                }
            }
        ]

    }
};
