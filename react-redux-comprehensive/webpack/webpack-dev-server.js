/**
 * Created by Nealyang on 17/3/19.
 */
const Express = require('express');

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('./dev.config');
//
const app = Express();
const port = require('../src/config').port+1;//注意此处port要和客户端的webpack的port端口保持一致

const compiler = webpack(webpackConfig);
app.use(webpackDevMiddleware(compiler,{
    noInfo:true,
    publicPath:webpackConfig.output.publicPath
}));
app.use(webpackHotMiddleware(compiler));

app.listen(port,(err)=>{
    if(err){
        console.error(err);
    }else{
        console.info(`==> 🚧  Webpack development server listening on port ${port}.`);
    }
});