import * as React from 'react';
import styles from './Afisha.module.scss';
import { noImage } from '../constants';

const Covers = (props) => (
    <div>
        <button onClick={()=>{props.currentDate.setDate(props.currentDate.getDate()-1); props.kinopoisk()}}>-</button>
    {props.events.map((item) => 
        (
            <div style={{display: 'inline-block'}}>
                <img src={item.imgurl ? 'https://image.tmdb.org/t/p/w200'+item.imgurl : noImage} width="150" height="225"></img>
                <p>{item.title}</p>
                <button onClick={()=>{
                    props.attendHandler(item,props.userName);
                    /*props.calHandler(item);*/
                    // props.recHandler(item,props.userName);
                    // props.addTempItem(item);
                    }}>Attend</button>
            </div>
        )
    )}
        <button onClick={()=>{props.currentDate.setDate(props.currentDate.getDate()+1); props.kinopoisk()}}>+</button>
    </div>
);
export default Covers;