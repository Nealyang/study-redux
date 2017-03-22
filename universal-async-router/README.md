react-redux实现多页面下异步操作+Universal渲染
===
Universal渲染
===
服务单的渲染是一个非常常见的需求，即是当用户第一次访问这个页面的时候，用它来做初始化的渲染，当服务器接收到请求之后，把它需要的组件
渲染成HTML字符串，然后返回给客户端。打住！服务端的渲染，就酱~

好吧，你一定想听我通俗的给你解释，就是给页面一个初始化的数据===>>>initial state

服务端使用redux
---
上面已经给了通俗的解释，那么，这里我们简单的说下，当在服务端使用redux的时候，一定要在响应中包含state，这样客户端就可以那这个返回的state作为初始化的state了。

那么为什么我们需要Universal渲染呢，或者说为什么我们需要给他一个initial state呢？不是因为怕第一次进入客户端，然后客户端再去发情求获取initial state会出现闪屏的现象嘛~~

安装依赖库
---
npm i express react-redux --save

服务端开发
---
服务端的开发大致就是我们给写一个中间件，注意这里是express的中间件，并不是前面说的[redux中间件](../redux-async/README.md),服务端的代码大致如下：

    import path from 'path';
    import Express from 'express';
    import React from 'react';
    import { createStore } from 'redux';
    import { Provider } from 'react-redux';
    import counterApp from './reducers';
    import App from './containers/App';
    
    const app = Express();
    const port = 3000;
    
    // 每当收到请求时都会触发
    app.use(handleRender);
    
    // 接下来会补充这部分代码
    function handleRender(req, res) { /* ... */ }
    function renderFullPage(html, preloadedState) { /* ... */ }
    
    app.listen(port);
    
 处理请求
  ---
  
  服务端渲染最关键的一步是在发送响应前渲染初始的 HTML。这就要使用 React.renderToString().
  
  然后使用 store.getState() 从 store 得到初始 state。renderFullPage 函数会介绍接下来如何传递
  
      import { renderToString } from 'react-dom/server'
      
      function handleRender(req, res) {
        // 创建新的 Redux store 实例
        const store = createStore(counterApp);
      
        // 把组件渲染成字符串
        const html = renderToString(
          <Provider store={store}>
            <App />
          </Provider>
        )
      
        // 从 store 中获得初始 state
        const preloadedState = store.getState();
      
        // 把渲染后的页面内容发送给客户端
        res.send(renderFullPage(html, preloadedState));
      }
      
注入初始组件的 HTML 和 State
---
服务端最后一步就是把初始组件的 HTML 和初始 state 注入到客户端能够渲染的模板中。如何传递 state 呢，我们添加一个 <script> 标签来把 preloadedState 赋给 window.__INITIAL_STATE__。

客户端可以通过 window.__INITIAL_STATE__ 获取 preloadedState。

同时使用 script 标签来引入打包后的 js bundle 文件。这是打包工具输出的客户端入口文件，以静态文件或者 URL 的方式实现服务端开发中的热加载。下面是代码。

    function renderFullPage(html, preloadedState) {
      return `
        <!doctype html>
        <html>
          <head>
            <title>Redux Universal Example</title>
          </head>
          <body>
            <div id="root">${html}</div>
            <script>
              window.__INITIAL_STATE__ = ${JSON.stringify(preloadedState)}
            </script>
            <script src="/static/bundle.js"></script>
          </body>
        </html>
        `
    }
    
关于客户端开发比较简单，这里就不赘述了，直接拿就行：

        // 通过服务端注入的全局变量得到初始 state
        const preloadedState = window.__INITIAL_STATE__
        
        // 使用初始 state 创建 Redux store
        const store = createStore(counterApp, preloadedState)
        
对于异步的，我们就放到回调函数中处理即可。

问题
---