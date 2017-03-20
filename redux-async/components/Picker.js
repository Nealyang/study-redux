/**
 * Created by Nealyang on 17/3/17.
 */
import React,{Component,PropTypes} from 'react';

export default class Picker extends Component{
    render(){
        const {value ,onChange,options} = this.props;
        return(
            <span>
                <h1>{value}</h1>
                <select
                    onChange={e=>onChange(e.target.value)}
                        value={value}
                >
                    {
                        options.map(option=>
                            <option key={option} value={option}>
                                {option}
                            </option>)
                    }
                </select>
            </span>
        )
    }
}

Picker.propTypes = {
    value:PropTypes.string.isRequired,
    onChange:PropTypes.func.isRequired,
    options:PropTypes.arrayOf(
        PropTypes.string.isRequired
    ).isRequired
};
