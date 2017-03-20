/**
 * Created by Nealyang on 17/3/17.
 */
import fetch from 'isomorphic-fetch';


export const REQUEST_POSTS = 'REQUEST_POSTS';//网络发出请求的时候动作
export const RECEIVE_POSTS = 'RECEIVE_POSTS';//收到回应的动作
export const SELECT_SUBREDDIT = 'SELECT_SUBREDDIT';//选择
export const INVALIDATE_SUBREDDIT = 'INVALIDATE_SUBREDDIT';//refresh

export function selectSubreddit(subreddit) {
    return {
        type: SELECT_SUBREDDIT,
        subreddit
    }
}

export function invalidateSubreddit(subreddit) {
    return {
        type: INVALIDATE_SUBREDDIT,
        subreddit
    }
}

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

function shouldFetchPosts(state, subreddit) {
    const posts = state.postsBySubreddit[subreddit];
    if (!posts) {
        return true;
    } else if (posts.isFetching) {
        return false
    }
    return posts.didInvalidate
}

export function fetchPostsIfNeeded(subreddit) {
    return (dispatch, getState) => {
        if (shouldFetchPosts(getState(), subreddit)) {
            return dispatch(fetchPosts(subreddit))
        }
    }
}


