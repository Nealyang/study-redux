/**
 * Created by Nealyang on 17/3/19.
 */
import path from 'path';
import express from 'express'
import favicon from 'serve-favicon'
import httpProxy from 'http-proxy'
import compression from 'compression'
import React from 'react'
import {renderToString} from 'react-dom/server'
import {Provider} from 'react-redux'
import {match, RouterContext} from 'react-router'
import configureStore from './utils/configureStore'
import getRouters from './routers'
import Html from './utils/Html'
import config from './config'

const app = express();
const port = config.port;
const targetUrl = 'http://' + config.apiHost + ':' + config.apiPort;
const proxy = httpProxy.createProxyServer({
    target: targetUrl
});

app.use(compression());
app.use(express.static(path.join(__dirname, '..', 'static')));
app.use(favicon(path.join(__dirname, '..', 'static', 'favicon.ico')));

app.use('/api', function (req, res) {
    proxy.web(req, res, {target: targetUrl})
});

app.use((req, res) => {
    global.__COOKIE__ = req.get('cookie');
    if (process.env.NODE_ENV != 'production') {
        webpackIsomorphicTools.refresh();
    }

    const store = configureStore();
    const routes = getRouters(store);

    function hydrateOnClient() {
        res.send('<!doctype html>\n' +
            renderToString(<Html assets={webpackIsomorphicTools.assets()} store={store}/>));
    }
    if (__DISABLE_SSR__) {
        hydrateOnClient();
        return;
    }

});
