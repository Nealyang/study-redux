react-redux实现多页面下异步操作+Universal渲染
===

---
重点说明：webpack-isomorphic-tools的使用
***

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
        
对于异步的，我们就放到回调函数中处理即可。具体可以看代码中的例子

问题
---
既然页面是由渲染服务端发出来的，我们有知道node中require只能引入js文件，对于页面所需要的css，img等这些东西怎么办呢？？
好吧，下面才是我们重点要说的：webpack-isomorphic-tools

webpack-isomorphic-tools
===
他给require函数加上一层魔法，使其不仅仅可以加载js文件，还可以加载图片，样式等资源文件。

简单的例子
---
这个例子演示在react components中使用require引入一张图片：

    // alternatively one can use `import`, 
    // but with `import`s hot reloading won't work
    // import image_path from '../image.png'
    
    // Just `src` the image inside the `render()` method
    class Photo extends React.Component
    {
      render()
      {
        // When Webpack url-loader finds this `require()` call 
        // it will copy `image.png` to the build folder 
        // and name it something like `9059f094ddb49c2b0fa6a254a6ebf2ad.png`, 
        // because Webpack is set up to use the `[hash]` file naming feature
        // which makes browser asset caching work correctly.
        return <img src={ require('../image.png') }/>
      }
    }
    
相信大家对上面的英语理解起来没难度~

上面代码在客户端运行没问题，因为webpack可以聪明的给require添加点点的魔法(url-loader),但是在服务端就不可以，会抛出SyntaxError错误。

所以这里我们就需要使用webpack-isomorphic-tools了，在webpack-isomorhpic-tools的帮助下，我们就可以在node中使用require来调用除js以外的别的资源文件了并且返回相应的文件路径给客户端。

安装
---
webpack-isomorphic-tools同时被使用在生产环境和开发环节中

    $ npm install webpack-isomorphic-tools --save
    
配置webpack.config.js
---
    var Webpack_isomorphic_tools_plugin = require('webpack-isomorphic-tools/plugin')
    
    var webpack_isomorphic_tools_plugin = 
      // webpack-isomorphic-tools 配置文件在一个单独的js文件
      // 因为这个配置文件同样也要被使用在服务端
      new Webpack_isomorphic_tools_plugin(require('./webpack-isomorphic-tools-configuration'))
      // 可会进入开发模式，毕竟这是一个开发环节的webpack配置文件
      .development()
    
    // 这就是一般的webpack配置
    module.exports =
    {
      context: '(必需！！！) 项目的根目录',
    
      module:
      {
        loaders:
        [
          ...,
          {
            test: webpack_isomorphic_tools_plugin.regular_expression('images'),
            loader: 'url-loader?limit=10240', 
          }
        ]
      },
    
      plugins:
      [
        ...,
    
        webpack_isomorphic_tools_plugin
      ]
    
      ...
    }

这里可能你对.development()感到困惑。其实结合项目就很容易明白了，这里简单说下，在开发模式下，他禁用asset缓存，并且启动热加载。当然，在生产环境下的webpack就不要调用了

对于webpack-isomorphic-tools加载的每一种类型的asset，webpack配置中都应该有对应的加载程序。所以webpack_isomorphic_tools / plugin提供了一个.regular_expression（asset_type）方法，asset_type参数取自您的webpack-isomorphic-tools配置：

    import Webpack_isomorphic_tools_plugin from 'webpack-isomorphic-tools/plugin'
    
    export default
    {
      assets:
      {
        images:
        {
          extensions: ['png', 'jpg', 'gif', 'ico', 'svg']
        }
      }
    }
    
接下来我们说一下服务端的配置，我们可以在我们的main.js文件中实例化一个webpack-isomorphic-tools

    var Webpack_isomorphic_tools = require('webpack-isomorphic-tools')
    
    //project_base_patch比如和webpack中的context相同
    var project_base_path = require('path').resolve(__dirname, '..')
    
    // 这个全局的变量后面会被使用在express的中间件里
    global.webpack_isomorphic_tools = new Webpack_isomorphic_tools(require('./webpack-isomorphic-tools-configuration'))
    // 初始化一个webpack-isomorphic-tools实例
    // 第一个参数是项目的根路径，并且等于webpack中的context
    .server(project_base_path, function()
    {
      // 至此，webpack-isomorphic-tools全部设置好了
      // 这个回调server.js里，放着你全部的后端代码
      require('./server')
    })
    
然后你需要创建一个express中间件，在服务端可以render一个页面

    import React from 'react'
    
    // HTML页面模板
    import Html from './html'
    
    export function page_rendering_middleware(request, response)
    {
      // 在开发环境中清除require()的缓存，使热更新能起作用
      if (_development_)
      {
        webpack_isomorphic_tools.refresh()
      }
    
      const page_component = [determine your page component here using request.path]
    
      const flux_store = [initialize and populate your flux store depending on the page being shown]
    
      response.send('<!doctype html>\n' +
            React.renderToString(<Html assets={webpack_isomorphic_tools.assets()} component={page_component} store={flux_store}/>))
    }
    
最后我们可以再HTML的render方法中使用assets

    import React, {Component, PropTypes} from 'react'
    import serialize from 'serialize-javascript'
    
    export default class Html extends Component{
      static propTypes =
      {
        assets    : PropTypes.object,
        component : PropTypes.object,
        store     : PropTypes.object
      }
    
      render()
      {
        const { assets, component, store } = this.props
    
        // "import" 在这里也可以使用
        // 但是如果那样的话你就不能在你的项目中使用热更新了
        // 所以我们这里用require
        // 因为import只会被执行一次，当application被加载的时候
        
        const picture = require('../assets/images/cat.jpg')
    
        // favicon
        const icon = require('../assets/images/icon/32x32.png')
    
        const html = 
        (
          <html lang="en-us">
            <head>
              <meta charSet="utf-8"/>
              <title>xHamster</title>
    
              {/* favicon */}
              <link rel="shortcut icon" href={icon} />
    
              {/* styles 这里的style仅仅会在你使用webpack-extra-text-plugin插件提取css文件的时候出现*/}
              {Object.keys(assets.styles).map((style, i) =>
                <link href={assets.styles[style]} key={i} media="screen, projection"
                      rel="stylesheet" type="text/css"/>)}
    
              {/*在开发环境下解决页面加载时候出现的闪动问题 */}
              { Object.keys(assets.styles).is_empty() ? <style dangerouslySetInnerHTML={{__html: require('../assets/styles/main_style.css')}}/> : null }
            </head>
    
            <body>
              {/* 加载图片 */}
              <img src={picture}/>
    
              {/* 渲染react 里面的一些components */}
              <div id="content" dangerouslySetInnerHTML={{__html: React.renderToString(component)}}/>
    
              {/*初始化state */}
              <script dangerouslySetInnerHTML={{__html: `window._flux_store_data=${serialize(store.getState())};`}} />
    
              {/* javascripts */}
              {Object.keys(assets.javascript).map((script, i) =>
                <script src={assets.javascript[script]} key={i}/>
              )}
            </body>
          </html>
        )
    
        return html
      }
    }
    
上面代码中assets就是从webpack-assets.json中读出来的，它是由webpack-isomorphic-tools创建在根目录的一个文件，里面维持着所有资源文件的路径

    {
      "javascript":
      {
        "main": "/assets/main-d8c29e9b2a4623f696e8.js"
      },
    
      "styles":
      {
        "main": "/assets/main-d8c29e9b2a4623f696e8.css"
      },
    
      "assets":
      {
        "./assets/images/cat.jpg": "http://localhost:3001/assets/9059f094ddb49c2b0fa6a254a6ebf2ad.jpg",
        
        "./assets/images/icon/32x32.png": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQffBhcWAg6gFw6bAAAB60lEQVRIx+3UTUjUQRzG8c+u/n2BDe3lIJtQSuYhsPTQG+TFYLulguStoA5dPHYogoKigoi8dIsOCd0iiC4JFYFQBAVZEUgklWVQqam4vu1uF111d1310qWe0/yemfnyzPyG4b8KllQl6jWqNuX3nFNun/0qjJpYGRB1TkyRWu0C76Q0uKhOkT1aDfqSP0uxTpetR1i9e2Iq3HVUCQKt7tuWP0GDmDOGkfJd3GEbhFwzg6T3alR5lg0Ip0fVPhhKV2+UqfNcMu28sjlXggVAXEQoXZVKmlC2aGXETH5Ary3q026zPg8dtGnOKXPIi/x3MCJwUtyUqBN2uarXTi1+Cql1yqibuTKElsCaHBFBn1v6sU67RoGkHl3GciVYDNiuWVSphDEJYaSkRBSbNqLHI7PZgML0qNIFrz3OwqZAuQ6BB8KqRL01nA3YbdCVRW3L1KxGTx1zQMI3p01nAkqN5NnOkBrXJZw1qlOlj5mAlTQuqluXcRGTSrOPsJJeajOQzphaOyDucy47vGrAMvqLgCLlS97HmgH17mgRzFWhbEAq43/M1EYF2p1XoVAgMW8vdKFfmx0+LbO9WJNut3W44Ze4r/MTC6cKHBczutDhJSrxwyWDAntt9cRANoCwqLKcgJApAyZXfV//mP4AWg969geZ6qgAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTUtMDYtMjNUMjI6MDI6MTQrMDI6MDBG88r0AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE1LTA2LTIzVDIyOjAyOjE0KzAyOjAwN65ySAAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAASUVORK5CYII="
      }
    }

因为它，你就可以使用require()在你的项目中实现universal 渲染了

## Configuration
```javascript
{
  // debug mode.
  //当设置为TRUE时，在console中可以看到调试信息
  debug: true, // is false by default

  // (可选的)
  // (推荐使用)
  //
  //当端口被设置时，这个port就会被使用】、
  //运行http server去为webpack assets服务，前提是你必须安装了express
  //
  //在开发环境下，webpack-assets.json文件并没有被写入到磁盘中，而是在内存中，并且被存储
  //
  //这个端口的设置当且仅当在开发环境下会有效果
  //
  // port: 8888, // is false by default

  // verbosity.
  //
  // 当设置为 'no webpack stats',
  // 在开发环境下，不会将Webpack统计信息输出到控制台
  // 这也意味着不会将Webpack错误或警告输出到控制台。
  //
  // 当设置 'webpack stats for each build',
  // 将Webpack统计信息输出到控制台
  //
  // 不设置任何值 (default), 在console答应webpack 的stats
  // 在开发模式下仅仅构建一次
  //
  // verbosity: ..., // is `undefined` by default

  //
  // patch_require: true, // 默认FALSE

  // By default it creates 'webpack-assets.json' file at 
  // webpack_configuration.context (which is your project folder).
  //默认情况下，在webpack_configuration.context指定的目录下创建webpack-assets.json文件
  // 当然，你也可以修改
  // (therefore changing both folder and filename).
  //
  // (relative to webpack_configuration.context which is your project folder)
  //
  webpack_assets_file_path: 'webpack-assets.json',

  // By default, when running in debug mode, it creates 'webpack-stats.json' file at 
  // webpack_configuration.context (which is your project folder).
  // You can change the stats file path as you wish
  // (therefore changing both folder and filename).
  //
  // (relative to webpack_configuration.context which is your project folder)
  //
  webpack_stats_file_path: 'webpack-stats.json',

  // Makes `webpack-isomorphic-tools` aware of Webpack aliasing feature
  // (if you use it)
  // https://webpack.github.io/docs/resolving.html#aliasing
  //
  // The `alias` parameter corresponds to `resolve.alias` 
  // in your Webpack configuration.
  //
  alias: webpack_configuration.resolve.alias, // is {} by default

  // if you're using Webpack's `resolve.modulesDirectories`
  // then you should also put them here.
  //
  // modulesDirectories: webpack_configuration.resolve.modulesDirectories // is ['node_modules'] by default

  // here you can define all your asset types
  //
  assets:
  {
    // keys of this object will appear in:
    //  * webpack-assets.json
    //  * .assets() method call result
    //  * .regular_expression(key) method call
    //
    png_images: 
    {
      // which file types belong to this asset type
      //
      extension: 'png', // or extensions: ['png', 'jpg', ...],

      // [optional]
      // 
      // here you are able to add some file paths 
      // for which the require() call will bypass webpack-isomorphic-tools
      // (relative to the project base folder, e.g. ./sources/server/kitten.jpg.js)
      // (also supports regular expressions, e.g. /^\.\/node_modules\/*/, 
      //  and functions(path) { return true / false })
      //
      // exclude: [],

      // [optional]
      // 
      // here you can specify manually the paths 
      // for which the require() call will be processed by webpack-isomorphic-tools
      // (relative to the project base folder, e.g. ./sources/server/kitten.jpg.js)
      // (also supports regular expressions, e.g. /^\.\/node_modules\/*/, 
      //  and functions(path) { return true / false }).
      // in case of `include` only included paths will be processed by webpack-isomorphic-tools.
      //
      // include: [],

      // [optional]
      // 
      // determines which webpack stats modules 
      // belong to this asset type
      //
      // arguments:
      //
      //  module             - a webpack stats module
      //
      //                       (to understand what a "module" is
      //                        read the "What's a "module"?" section of this readme)
      //
      //  regular_expression - a regular expression 
      //                       composed of this asset type's extensions
      //                       e.g. /\.scss$/, /\.(ico|gif)$/
      //
      //  options            - various options
      //                       (development mode flag,
      //                        debug mode flag,
      //                        assets base url,
      //                        project base folder,
      //                        regular_expressions{} for each asset type (by name),
      //                        webpack stats json object)
      //
      //  log
      // 
      // returns: a Boolean
      //
      // by default is: "return regular_expression.test(module.name)"
      //
      // premade utility filters:
      //
      // Webpack_isomorphic_tools_plugin.style_loader_filter
      //  (for use with style-loader + css-loader)
      //
      filter: function(module, regular_expression, options, log)
      {
        return regular_expression.test(module.name)
      },

      // [optional]
      //
      // transforms a webpack stats module name 
      // to an asset path (usually is the same thing)
      //
      // arguments:
      //
      //  module  - a webpack stats module
      //
      //            (to understand what a "module" is
      //             read the "What's a "module"?" section of this readme)
      //
      //  options - various options
      //            (development mode flag,
      //             debug mode flag,
      //             assets base url,
      //             project base folder,
      //             regular_expressions{} for each asset type (by name),
      //             webpack stats json object)
      //
      //  log
      // 
      // returns: a String
      //
      // by default is: "return module.name"
      //
      // premade utility path extractors:
      //
      // Webpack_isomorphic_tools_plugin.style_loader_path_extractor
      //  (for use with style-loader + css-loader)
      //
      path: function(module, options, log)
      {
        return module.name
      },

      // [optional]
      // 
      // parses a webpack stats module object
      // for an asset of this asset type
      // to whatever you need to get 
      // when you require() these assets 
      // in your code later on.
      //
      // this is what you'll see as the asset value in webpack-assets.json: 
      // { ..., path(): compile(parser()), ... }
      //
      // can be a CommonJS module source code:
      // module.exports = ...what you export here is 
      //                     what you get when you require() this asset...
      //
      // if the returned value is not a CommonJS module source code
      // (it may be a string, a JSON object, whatever) 
      // then it will be transformed into a CommonJS module source code.
      //
      // in other words: 
      //
      // // making of webpack-assets.json
      // for each type of configuration.assets
      //   modules.filter(type.filter).for_each (module)
      //     assets[type.path()] = compile(type.parser(module))
      //
      // // requiring assets in your code
      // require(path) = (path) => return assets[path]
      //
      // arguments:
      //
      //  module  - a webpack stats module
      //
      //            (to understand what a "module" is
      //             read the "What's a "module"?" section of this readme)
      //
      //  options - various options
      //            (development mode flag,
      //             debug mode flag,
      //             assets base url,
      //             project base folder,
      //             regular_expressions{} for each asset type (by name),
      //             webpack stats json object)
      //
      //  log
      // 
      // returns: whatever (could be a filename, could be a JSON object, etc)
      //
      // by default is: "return module.source"
      //
      // premade utility parsers:
      //
      // Webpack_isomorphic_tools_plugin.url_loader_parser
      //  (for use with url-loader or file-loader)
      //  require() will return file URL
      //  (is equal to the default parser, i.e. no parser)
      //
      // Webpack_isomorphic_tools_plugin.css_loader_parser
      //  (for use with css-loader when not using "modules" feature)
      //  require() will return CSS style text
      //
      // Webpack_isomorphic_tools_plugin.css_modules_loader_parser
      //  (for use with css-loader when using "modules" feature)
      //  require() will return a JSON object map of style class names
      //  which will also have a `_style` key containing CSS style text
      //
      parser: function(module, options, log)
      {
        log.info('# module name', module.name)
        log.info('# module source', module.source)
        log.info('# project path', options.project_path)
        log.info('# assets base url', options.assets_base_url)
        log.info('# regular expressions', options.regular_expressions)
        log.info('# debug mode', options.debug)
        log.info('# development mode', options.development)
        log.debug('debugging')
        log.warning('warning')
        log.error('error')
      }
    },
    ...
  },
  ...]
}
```


    