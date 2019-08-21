import * as React from 'react';
import styles from './Afisha.module.scss';
import { noImage } from '../constants';

// async function  statusCAML(myfunction,title, username){
//     let itemStatus = await myfunction(title,username).then(()=>{
//         console.log(itemStatus)
//     })
// }
const Covers = (props) => (
    <div>
        <button onClick={() => { props.currentDate.setDate(props.currentDate.getDate() - 1); props.kinopoisk(); }}>-</button>
        {props.events.map( (item) => {
            // let itemst = statusCAML(props.findStatusCAML,item.title,props.userName);
            // let itemStatus = await props.findStatusCAML(item.title,props.userName);
            // setTimeout(()=>console.log(itemStatus),3000);
            return (
                <div style={{ display: 'inline-block' }}>
                    <img src={item.imgurl ? 'https://image.tmdb.org/t/p/w200' + item.imgurl : noImage} width="150" height="225"></img>
                    <p>{item.title}</p>
                    <button onClick={() => {
                        props.attendHandler(item, props.userName,1);
                        /*props.calHandler(item);*/
                        // props.recHandler(item,props.userName);
                        // props.addTempItem(item);
                    }}>Attend</button>
                    <button onClick={() => props.interestHandler(item.title, props.userName)}>delete if exists</button>
                </div>
            )
        }
        )}
        <button onClick={() => { props.currentDate.setDate(props.currentDate.getDate() + 1); props.kinopoisk(); }}>+</button>
    </div>
);
export default Covers;