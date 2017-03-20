// /**
//  * Created by Nealyang on 17/3/16.
//  */
// import { createStore } from 'redux'
// import todoApp from './reducers/reducers'
// let store = createStore(todoApp);
// import { addTodo, toggleTodo, setVisibilityFilter, VisibilityFilters } from './actions/actions'
//
// // 打印初始状态
// console.log(store.getState())
//
// // 每次 state 更新时，打印日志
// // 注意 subscribe() 返回一个函数用来注销监听器
// let unsubscribe = store.subscribe(() =>
//     console.log(store.getState())
// );
//
// // 发起一系列 action
// store.dispatch(addTodo('Learn about actions'))
// store.dispatch(addTodo('Learn about reducers'))
// store.dispatch(addTodo('Learn about store'));
// store.dispatch(toggleTodo(0))
// store.dispatch(toggleTodo(1))
// store.dispatch(setVisibilityFilter(VisibilityFilters.SHOW_COMPLETED))
//
// // 停止监听 state 更新
// unsubscribe();

import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import App from './containers/App'
import todoApp from './reducers/reducers'

let store = createStore(todoApp,window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

let rootElement = document.getElementById('root');
render(
    <Provider store={store}>
        <App />
    </Provider>,
    rootElement
);