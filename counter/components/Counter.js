/**
 * Created by Nealyang on 17/3/18.
 */
import React,{Component,PropTypes} from 'react';

export default class Counter extends Component{
    render(){
        const {counter,increment,decrement,incrementIfOdd,incrementAsync} = this.props;
        return(
            <p>
                Clicked:{counter} times
                {'  '}
                <button onClick={increment}>+</button>
                {'  '}
                <button onClick={decrement}>-</button>
                {'  '}
                <button onClick={incrementIfOdd}>increment if Odd</button>
                {'  '}
                <button onClick={incrementAsync}>increment async</button>
            </p>
        )
    }
}

Counter.propTypes = {
    counter:PropTypes.number.isRequired,
    increment:PropTypes.func.isRequired,
    decrement:PropTypes.func.isRequired,
    incrementIfOdd:PropTypes.func.isRequired,
    incrementAsync:PropTypes.func.isRequired
};

