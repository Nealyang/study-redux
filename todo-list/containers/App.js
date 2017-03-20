/**
 * Created by Nealyang on 17/3/16.
 */
import React,{Component,PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import { addTodo, completeTodo, setVisibilityFilter, VisibilityFilters } from '../actions/actions';
import AddTodo from '../components/AddTodo';
import TodoList from '../components/TodoList';
import Footer from '../components/Footer';

class App extends Component{
    render(){
        const { dispatch, visibleTodos, visibilityFilter,onAddClick ,onTodoClick,onFilterChange} = this.props;
        return(
            <div>
                <AddTodo onAddClick={onAddClick}/>
                <TodoList onTodoClick={onTodoClick} todos={visibleTodos}/>
                <Footer onFilterChange={onFilterChange} filter={visibilityFilter}/>
            </div>
        )
    }
}

App.propTypes = {
    visibleTodos: PropTypes.arrayOf(PropTypes.shape({
        text: PropTypes.string.isRequired,
        completed: PropTypes.bool.isRequired
    }).isRequired).isRequired,
    visibilityFilter: PropTypes.oneOf([
        'SHOW_ALL',
        'SHOW_COMPLETED',
        'SHOW_ACTIVE'
    ]).isRequired
}
/*
 mapStateToProps(state, ownProps) : stateProps
 允许我们将 store 中的数据作为 props 绑定到组件上
 第一个参数就是 Redux 的 store
 当然，你不必将 state 中的数据原封不动地传入组件，可以根据 state 中的数据，动态地输出组件需要的（最小）属性
 */
function selectTodos(todos,filter) {
    switch (filter){
        case VisibilityFilters.SHOW_ALL:
            return todos;
        case VisibilityFilters.SHOW_COMPLETED:
            return todos.filter(todo => todo.completed);
        case VisibilityFilters.SHOW_ACTIVE:
            return todos.filter(todo => !todo.completed);
    }
}


function mapStatetoProps(state) {
    return{
        visibleTodos: selectTodos(state.todos, state.visibilityFilter),
        visibilityFilter: state.visibilityFilter
    }
}

/*
 mapDispatchToProps(dispatch, ownProps): dispatchProps
 将 action 作为 props 绑定到 MyComp 上。
 为了不让App 组件感知到 dispatch 的存在，我们需要将
 onAddClick 和 onTodoClick 和onFilterChange函数包装一下，使之成为直接可被调用的函数（即，调用该方法就会触发 dispatch ）。
 */

// const mapDispatchToProps = (dispath,ownProps)=>{
//     return{
//         onAddClick:(...args)=>dispath(addTodo(...args)),
//         onTodoClick:(...args)=>dispath(completeTodo(...args)),
//         onFilterChange:(...args)=>dispath(setVisibilityFilter(...args))
//     }
// }
const mapDispatchToProps = (dispath,ownProps)=>{
    // return{
    //     onAddClick:(...args)=>dispath(addTodo(...args)),
    //     onTodoClick:(...args)=>dispath(completeTodo(...args)),
    //     onFilterChange:(...args)=>dispath(setVisibilityFilter(...args))
    // };

    return bindActionCreators({
        onAddClick:addTodo,
        onTodoClick:completeTodo,
        onFilterChange:setVisibilityFilter
    },dispath)
}

export default connect(mapStatetoProps,mapDispatchToProps)(App)