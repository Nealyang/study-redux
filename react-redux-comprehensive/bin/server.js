/**
 * Created by Nealyang on 17/3/19.
 */
const path = require('path');
const rootDir = path.resolve(__dirname,'..');

const WebpackIsomorphicTools = require('webpack-isomorphic-tools');

global.__SERVER__ = true;
global.__DISABLE_SSR__ = true;
global.__COOKIE__ = true;

if(process.env.NODE_ENV == 'production'){
    global.webpackIsomorphicTools = new WebpackIsomorphicTools(
        require('../webpack/webpack-isomorphic-tools'))
        .server(rootDir,function () {
            require('../build/server');
        });

}else{
    require('babel-register');
    global.webpackIsomorphicTools = new WebpackIsomorphicTools(require('../webpack/webpack-isomorphic-tools'))
        .development()
        .server(rootDir,function () {
            require(require('../src/server'));
        })
}

