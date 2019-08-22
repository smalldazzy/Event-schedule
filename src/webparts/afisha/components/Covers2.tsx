import * as React from 'react';
import { noImage } from '../constants';

interface ICoversProps {
    events
    userName: string
    currentDate: Date
    kinopoisk
    attendHandler
    interestHandler
    findStatusCAML
    btnStatus: Array<number>
}
interface ICoversState {
    btnstatus: Array<number>,
}
export default class Covers2 extends React.Component<ICoversProps, ICoversState> {
    public render(): React.ReactElement<any> {
        return (
            <div>
                <button onClick={() => { this.props.currentDate.setDate(this.props.currentDate.getDate() - 1); this.props.kinopoisk(); }}>-</button>
                {this.props.events.map((item, index) => {
                    return (
                        <div style={{ display: 'inline-block' }}>
                            <img src={item.imgurl ? 'https://image.tmdb.org/t/p/w200' + item.imgurl : noImage} width="150" height="225"></img>
                            <p>{item.title}</p>
                            <p>{this.props.btnStatus[index]}</p>
                            <button onClick={(e) => {
                                if ((e.target as HTMLElement).innerHTML === 'Attend') {
                                    (e.target as HTMLElement).innerHTML = "Won't attend";
                                } else { (e.target as HTMLElement).innerHTML = 'Attend'; }
                                this.props.attendHandler(item, this.props.userName, this.props.btnStatus[index]);
                            }}>{this.props.btnStatus[index] === 1 ? "Won't attend" : 'Attend'}</button>
                            <button onClick={(e) => {
                                if ((e.target as HTMLElement).innerHTML === 'Interested') {
                                    (e.target as HTMLElement).innerHTML = 'Not interested';
                                } else { (e.target as HTMLElement).innerHTML = 'Interested'; }
                                this.props.interestHandler(item, this.props.userName, this.props.btnStatus[index]);
                            }}>{this.props.btnStatus[index] === 2 ? 'Not interested' : 'Interested'}</button>
                        </div>
                    )
                }
                )}
                <button onClick={() => { this.props.currentDate.setDate(this.props.currentDate.getDate() + 1); this.props.kinopoisk(); }}>+</button>
            </div>
        )
    }
}
