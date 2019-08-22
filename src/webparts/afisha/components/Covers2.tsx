import * as React from 'react';
import styles from './Afisha.module.scss';
import { noImage } from '../constants';

// async function  statusCAML(myfunction,title, username){
//     let itemStatus = await myfunction(title,username).then(()=>{
//         console.log(itemStatus)
//     })
// }
interface ICoversProps {
    events
    userName: string
    currentDate: Date
    kinopoisk
    attendHandler
    interestHandler
    findStatusCAML
}
interface ICoversState {
    btnstatus: Array<number>
}
export default class Covers2 extends React.Component<ICoversProps, ICoversState> {
    public state = {
        btnstatus: []
    }
    private async statusCAML(myfunction, title, username) {
        let itemStatus = await myfunction(title, username).then((r) => {
            if (r){
                console.log(r);
                let arr = this.state.btnstatus;
                arr.push(r);
            }
        })
    }
    public componentWillMount(){
        this.props.events.map((item)=>{
            this.statusCAML(this.props.findStatusCAML,item.title,this.props.userName);
        })
    }
    public render(): React.ReactElement<any> {
        return (
            <div>
                <button onClick={() => { this.props.currentDate.setDate(this.props.currentDate.getDate() - 1); this.props.kinopoisk(); }}>-</button>
                {this.props.events.map((item) => {
                    this.statusCAML(this.props.findStatusCAML,item.title,this.props.userName);
                    // let itemStatus = await props.findStatusCAML(item.title,props.userName);
                    // setTimeout(()=>console.log(itemStatus),3000);
                    console.log(this.state.btnstatus);
                    return (
                        <div style={{ display: 'inline-block' }}>
                            <img src={item.imgurl ? 'https://image.tmdb.org/t/p/w200' + item.imgurl : noImage} width="150" height="225"></img>
                            <p>{item.title}</p>
                            <p>{this.state.btnstatus}</p>
                            <button onClick={() => {
                                this.props.attendHandler(item, this.props.userName, 1);
                                /*props.calHandler(item);*/
                                // props.recHandler(item,props.userName);
                                // props.addTempItem(item);
                            }}>Attend</button>
                            <button onClick={() => this.props.interestHandler(item.title, this.props.userName)}>delete if exists</button>
                        </div>
                    )
                }
                )}
                <button onClick={() => { this.props.currentDate.setDate(this.props.currentDate.getDate() + 1); this.props.kinopoisk(); }}>+</button>
            </div>
        )

    }
}
