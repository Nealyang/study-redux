/**
 * Created by Nealyang on 17/3/18.
 */
import React,{Component,PropTypes} from 'react'
import Counter from '../components/Counter'
import {connect} from 'react-redux';
import * as ActionCreators from '../actions'

class App extends Component{
    render(){
        const {counter,increment,decrement,incrementIfOdd,incrementAsync} = this.props;
        return(
            <Counter
                counter={counter}
                increment={increment}
                decrement={decrement}
                incrementIfOdd={incrementIfOdd}
                incrementAsync={incrementAsync}/>
        )
    }
}

App.propTypes = {
    counter:PropTypes.number.isRequired,
    increment:PropTypes.func.isRequired,
    decrement:PropTypes.func.isRequired,
    incrementIfOdd:PropTypes.func.isRequired,
    incrementAsync:PropTypes.func.isRequired
};

export default connect(
    state=>({
        counter:state.counter
    }),
    ActionCreators
)(App);


