通过Redux的异步操作来深入了解Redux的中间件
===
前言：前面面我们有说到关于[redux的基本概念以及react-redux的基本用法](../README.md)

[更多的redux的基本用法实例可以点击这里](../todo-list)

对的，你也发现，上面的操作都是同步的操作，在实际的项目开发中很多的数据来源都是通过API获取下来的，那么如果这样的话我们该怎么编写我们的redux呢？

当然，这个也对应了我们上一篇留下的一个疑惑：为什么action creator返回不是简单的action对象

---
欢迎大神小白加入：<br>
Node.js技术交流群：209530601 <br>
React技术栈：398240621<br>
一起学习，一起进步
***

中间件基本概念
---
这里我们不卖关子，直接干，对的，我们要想实现redux的异步操作，就是需要运用到中间件：middleware。

在说中间件之前，再来回顾下redux：
+ State，前端数据库，只读的，我们操作不了它
+ View：与state对应的，只会发出信号然后展示美
+ reducer：一个纯函数。一再强调不要修改传入的参数，不要执行代有副作用的操作(API请求，路由跳转),不要调用非纯函数

所以怎么办，action如果在再不能给我动刀，那么redux就不能修改去进行一步操作了。。。所以，别的特性是铁打的，也是非常重要的，不能破坏，所以这个重任，只能落到action身上了。

Action是负责传递消息的，就是被别人拿去操刀的，而自己不会有任何动作。

所以，我们的中间件就是对发送action这个步骤增加功能项的。让action变得强大，让他可以返回一个函数。

直接操刀异步
---
在调动异步的API的时候，有两个时刻是非常重要的，一个是请求发出的时候，一个是请求结束的时候(成功or失败)，所以在每一个重要的时刻，我们都dispatch一个相应的action岂不是就可以告诉reducer在对的时间如何创建新的state了？

注意：虽然我们是异步操作，但是我们dispatch的始终是普通的action。

在说明如何发送这两个重要时刻的action之前，先了解下发送什么action

1、操作发起时候的action

2、操作成功的action

3、操作失败时候的action

对应的：

    { type: 'FETCH_POSTS' }
    { type: 'FETCH_POSTS', status: 'error', error: 'Oops' }
    { type: 'FETCH_POSTS', status: 'success', response: { ... } }

当然，action写法你可以随意~

但是state的写法不能随意，一般我们是这么约束的state的

    let state = {
      // ... 
      isFetching: true,
      didInvalidate: true,
      lastUpdated: 'xxxxxxx'
    };

这三个变量意思分别是：isFetching:表示是否正在获取数据，一般这时候我们会有一个loading，didInvalidate:表示获取数据是否超时。lastUpdate：表示上次更新的时间

所以上面我说的两个重要的时刻也就是，异步发起时的一个时刻，我们发一个action，另一个是异步结束的时候，发起一个action

所以这个时候我们就可以来编写我们的异步action creator了。所谓的异步action creator，其实就是包含异步请求的action creator。
这里我们需要用到Thunk中间件来强化action creator。

这里的举例，我们拿用烂了的例子来说明：[reddit](./)，从这个例子我们可以看出action creator真正的用武之地是逻辑的处理。

运行：
+ npm  i  
+ npm start

首先我们需要安装redux-thunk中间件，然后来编写我们的action creator。

    function fetchPosts(subreddit) {
        return dispath => {
            dispath(requestPosts(subreddit));
            return fetch(`https://www.reddit.com/r/${subreddit}.json`)
                .then(response => response.json())
                .then(responseJson => dispath(receivePosts(subreddit, responseJson)))
                .catch(err => {
                    alert(err)
                })
        }
    }

这里我们直接返回一个函数，传入dispatch正是我们熟悉的那个dispatch，第一次dispatch的是请求开发发出的时候，后面一次dispatch的是我们请求结束的时候。

上面对应的requestPosts,receivePosts如下：

    function requestPosts(subreddit) {
        return {
            type: REQUEST_POSTS,
            subreddit
        }
    }
    
    function receivePosts(subreddit, json) {
        return {
            type: RECEIVE_POSTS,
            subreddit,
            posts: json.data.children.map(child => child.data),
            receivedAt: new Date().toLocaleString()
        }
    }

然后对应到reducer中的处理如下：

    function posts(state = {
        isFetching: false,//表示是否在抓取数据
        didInvalidate: false,//表示数据是否超时
        items: []
    }, action) {
        switch (action.type) {
            case INVALIDATE_SUBREDDIT:
                return Object.assign({}, state, {
                    didInvalidate: true
                });
            case REQUEST_POSTS:
                return Object.assign({}, state, {
                    isFetching: true,
                    didInvalidate: false
                });
            case RECEIVE_POSTS:
                return Object.assign({}, state, {
                    isFetching: false,
                    didInvalidate: false,
                    items: action.posts,
                    lastUpdated: action.receivedAt
                });
            default:
                return state;
        }
    }
    
虽然是异步的，但是真正理解的去看，其实和同步的action没有太大的区别。

对于上面的代码，需要注意的是：

+ action creator在异步操作的时候，返回的是一个函数，而不是单纯地action对象。
+ 第一次发出的requestPosts(subreddit)表示请求的开始
+ 第二次发出的receivePosts(subreddit, responseJson)表示请求的结束。

这里我们使用的中间件是redux-thunk，当然，还有别的更加优秀的中间件，如redux-promise
等，感兴趣的哥们可以查查文档。

那么问题来了，我们的中间件是怎么放入到项目上去加工的action creator的呢？

代码当然很简单：

    export default function configureStore(preloadedState) {
        return createStore(
            rootReducer,
            preloadedState,
            applyMiddleware(
                thunkMiddleware,
                loggerMiddleware
            )
        )
    }

所以这里applyMiddleware到底做了什么呢？？

深入理解中间件
===
中间件的功能
---
从上面的异步操作可以看出，中间就是使action creator可以返回一个函数进行条件判断、异步操作。如果没有中间件，action creator就只能返回一个普通的action对象。

因为中间件只是redux发起action过程中的一个处理函数，所以你可以使用中间件做任何你想做的与action有关的事情，比如打印日志啊等等

中间件最大的特点就是可以串联使用，所以我们可以使用中间件来强化我们的action creator。

中间件的编写
---
了解了中间的功能，应该可以感受到中间件的编写也是非常简单的：

    export default store=>next=>action=>{
      return next(action)
    }

可能这么看有点迷糊，用es5写出来是酱紫的：

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    
    exports.default = function (store) {
      return function (next) {
        return function (action) {
          return next(action);
        };
      };
    };
    
 所以我们可以看出中间件一共套了三层函数，分别传递了store，next，action，并在函数最后返回了next(action).
 由于中间件的每一层函数将来都是要独立运行的，所以这里我们并不能在一层中传递这三个参数。
 
 简单解释下每一层函数的具体意义：
 + 最外层的函数参数为store，这个函数仅仅是为里面的函数提供store，然后里面的函数就可以调用store的一些玩意儿了，比如store.getState,store.dispatch
 + 中间的参数为next，其实next的本质是dispatch，这层函数是一个高阶函数，它接受dispatch作为一个参数，然后返回一个更加高级的dispatch
 + 最里面的函数参数为action，这个函数就是最后要取代dispatch的函数。
 
 可能说的非常的空洞，下面我们来看一下applyMiddleware的源码，看看redux是怎么解析中间件的就明白了
 
 applyMiddleware源码
 ---
 
 不管你嵌套多少层，是函数总归是要运行的，所以这里的middleware的执行应该是：middleware()()()
 
 + middleware()返回一个参数为next的函数，对应中间件的第二层
 + middleware()()返回的是一个参数为action的函数，也即是来取代dispatch的
 + middleware()()()也就相当于执行了
 
 applyMIddleware源码如下：
 
    export function applyMiddleware(...middlewares: Middleware[]): GenericStoreEnhancer;
    
    export type StoreEnhancer<S> = (next: StoreEnhancerStoreCreator<S>) => StoreEnhancerStoreCreator<S>;
    export type GenericStoreEnhancer = <S>(next: StoreEnhancerStoreCreator<S>) => StoreEnhancerStoreCreator<S>;
    export type StoreEnhancerStoreCreator<S> = (reducer: Reducer<S>, preloadedState?: S) => Store<S>;
 
    export interface Middleware {
       <S>(api: MiddlewareAPI<S>): (next: Dispatch<S>) => Dispatch<S>;
     }
     ...
  
  好吧，这个读起来相当的晦涩难懂，我从网上查了下他的源码，大致如下：
  
      import compose form './compose'
      
      ...
      
      export default function applyMiddleware(...middleware){
        return(createStore)=>(reducer,initialState,enhancer)=>{
            var store = createStore(reducer,initialState,enhancer);
            var dispatch = store.dispatch;
            var chain = [];
            var middlewareAPI = {
                getState:store.getState,
                dispatch:(action)=>dispatch(action)
            };
            chain = middlewares.map(middleware=>middleware(middlewareAPI))
            dispatch = compose(...chain)(store.dispatch)
            
            return{
            ...store,
            dispatch
            }
        }
      }
      
 简单解读下：
 + 中间件的最外层的执行发生在这里：chain = middlewares.map(middleware=>middleware(middlewareAPI))；使用展开语法将我们写进去的中间件，生成一个中间件数组
 middlewares，遍历每一个中间件，执行最外层的函数，也就是参数为store那一次。而这里的store是middlewareAPI。
 + 第二层函数的执行代码是：dispatch = compose(...chain)(store.dispatch)；compose是一种函数嵌套的写法。作用就是将里面的函数生成嵌套函数，store.dispatch是整个嵌套函数的入口参数。一个纯纯的dispatch就要被拿进去加工成为强大的dispatch了
 ，这个过程也是使用函数式编程的Pipe思想。然后我们就拿到了最后的return，里面的store和dispatch。
 
+ 那么第三层函数执行呢？？？好吧，第三层函数的执行并不是在这里，而是在我们每一次使用这个加工后的dispatch方法发起action时，第三层函数就执行了。

好吧，也不知道扯明白了没有，关于redux异步操作，以及中间件的概念大概就是酱紫吧。

话说你是不是很想自己写一个中间件试试了呢？？？
 