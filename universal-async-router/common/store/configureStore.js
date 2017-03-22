/**
 * Created by Nealyang on 17/3/22.
 */
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { asyncMiddleware } from 'redux-amrc';
import rootReducer from '../reducers';

export default function configureStore(initialState) {
    const store = createStore(
        rootReducer,
        initialState,
        compose(
            applyMiddleware(thunk, asyncMiddleware),
            typeof window === 'object' &&
            typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
        )
    );

    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        //import不能触发热更新
        module.hot.accept('../reducers', () => {
            const nextRootReducer = require('../reducers').default;
            store.replaceReducer(nextRootReducer);
        });
    }

    return store;
}

