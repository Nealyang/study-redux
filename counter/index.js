/**
 * Created by Nealyang on 17/3/18.
 */
import React from 'react'
import {render} from 'react-dom'
import { createStore, applyMiddleware } from 'redux';
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import reducers from './reducers'
import App from './containers/App'
import Connect2 from './containers/Connect2';
import Connect3 from './containers/Connect3';
import Connect4 from './containers/Connect4';

const store = createStore(reducers,window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),applyMiddleware(thunk));
const rootEl = document.getElementById('root');

render(
    <Provider store={store}>
        <div>
            <h2>使用react-redux连接</h2>
            <ul>
                <li>
                    connect()的前两个参数分别为函数和对象：
                    <App/>
                </li>
                <li>
                    connect()的前两个参数均为函数：
                    <Connect2 />
                </li>
                <li>
                    connect()的前两个参数均为函数，但使用了bindActionCreators：
                    <Connect3 />
                </li>
                <li>
                    connect()的第二个参数为空：
                    <Connect4 />
                </li>
            </ul>
        </div>
    </Provider>,rootEl
);