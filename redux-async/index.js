/*
 通过使用指定的 middleware，action 创建函数除了返回 action 对象外还可以返回函数。
 这时，这个 action 创建函数就成为了 thunk。
 当 action 创建函数返回函数时，这个函数会被 Redux Thunk middleware 执行。这个函数并不需要保持纯净；
 它还可以带有副作用，包括执行异步 API 请求。这个函数还可以 dispatch action，就像 dispatch 前面定义的同步 action 一样。
 */
import 'babel-polyfill'

import React from 'react'
import { render } from 'react-dom'
import Root from './containers/Root'

render(
    <Root />,
    document.getElementById('root')
);