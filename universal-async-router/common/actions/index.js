/**
 * Created by Nealyang on 17/3/22.
 */
import 'isomorphic-fetch'
import {ASYNC} from 'redux-amrc'
export const INCREMENT_COUNTER = 'INCREMENT_COUNTER';
export const DECREMENT_COUNTER = 'DECREMENT_COUNTER';

export function increment() {
    return {
        type:INCREMENT_COUNTER
    }
}

export function decrement() {
    return{
        type:DECREMENT_COUNTER
    }
}

export function incrementIfOdd() {
    return (dispatch,getState)=>{
        const {async} = getState();
        if(async.counter.value %2 == 0){
            return ;
        }
        dispatch(increment())
    }
}

export function incrementAsync() {
    return dispatch=>{
        setTimeout(()=>{
            dispatch(increment())
        },1000);
    }
}

export function load() {
    return{
        [ASYNC]:{
            key:'counter',
            promise:()=>fetch('http://localhost:3000/api/counter')
                .then(res=>{
                    if(!res.ok){
                        throw new Error(res.statusText)
                    }
                    return res.json();
                })
        }
    }
}
