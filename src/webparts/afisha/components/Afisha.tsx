import * as React from 'react';
import styles from './Afisha.module.scss';
import { IAfishaProps } from './IAfishaProps';
import { escape } from '@microsoft/sp-lodash-subset';
import pnp, { Web, sp } from 'sp-pnp-js';
import { DetailsList, DetailsListLayoutMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import Covers from './Covers';
import { MSGraphClient } from '@microsoft/sp-http';
import { Client } from '@microsoft/microsoft-graph-client';
import { string } from 'prop-types';


export default class Afisha extends React.Component<IAfishaProps, {}> {
  public state = {
    columns: this.columsCreate(['Title', 'EventDate', 'EndDate']),
    recitems: [],
    events: [],
    userName: '', 
    currentdate: new Date()
  };
  // private getList(listid: string) {
  //   let wep = new Web('https://cupcuper.sharepoint.com/sites/dev1');
  //   wep.lists.getById(listid).items.get().then((response) => {
  //   // wep.lists.getById('a5558fa4-8101-4bd8-b487-d9cadfef789d').items.get().then((response) => {
  //     console.log(response);
  //     this.setState({ recitems: response });
  //   });
  // }
  private getSearch() {
    let url = `https://cupcuper.sharepoint.com/search/_api/search/query?querytext='a5558fa4-8101-4bd8-b487-d9cadfef789d'&selectproperties='Title%2cEventDateOWSDate%2cEndDateOWSDate'&clienttype='ContentSearchRegular'`;
    // let url = `https://cupcuper.sharepoint.com/search/_api/search/query?querytext='5f0e9e0b-a4b4-457f-91fb-46a98119727e'&selectproperties='Title%2cEventDateOWSDate%2cEndDateOWSDate'&clienttype='ContentSearchRegular'`;
    fetch(url, {
      method: 'get',
      headers: {
        'accept': "application/json;odata=verbose",
        'content-type': "application/json;odata=verbose",
      }
    }).then((response) => response.json()).then((d) => {
      let arr = d.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results.slice(1);
      let viewlist = [];
      arr.forEach((item) => {
        viewlist.push({
          Title: item.Cells.results[2].Value,
          EventDate: item.Cells.results[3].Value,
          EndDate: item.Cells.results[4].Value
        });
      });
      console.log(viewlist);
      this.setState({ recitems: viewlist });
    }
    );
  }
  private kinopoisk() {
    let date = new Date().toISOString().split('T')[0];
    console.log('jepa');
    console.log(this.state.currentdate.toISOString().split('T')[0]);
    let newDate = this.state.currentdate.toISOString().split('T')[0];
    // let dateend1 = date1;
    // dateend1.setDate(date1.getDate()+1);
    // let date = date1.toISOString().split('T')[0];
    // let dateend = dateend1.toISOString().split('T')[0];
    // console.log(date);
    let uri = `https://api.themoviedb.org/3/discover/movie?primary_release_date.gte=${newDate}&primary_release_date.lte=${newDate}`;
    let url = `https://cors-anywhere.herokuapp.com/https://api.themoviedb.org/3/movie/now_playing/`;
    fetch(uri, {
      method: 'get',
      // mode: 'no-cors',
      headers: {
        // 'api_key': "16aaa61d3f82cbd45b6b9b51eeb4d2bf",
        'accept': "application/json;odata=verbose",
        'content-type': "application/json;odata=verbose"
      }
    }).then((r) => r.json())
      .then((r) => {
        let events = [];
        r.results.slice(0,3).forEach((item) => {
          events.push({
            id: item.id,
            title: item.title,
            imgurl: 'https://image.tmdb.org/t/p/w200' + item.poster_path,
            date: item.release_date,
          });
        });
        console.log(events);        
        this.setState({ events: events });
      });
  }
  public addTempItem(item){
    let newRecItems = this.state.recitems;
    newRecItems.push({
      Title: item.title,
      EventDate: item.date,
      EndDate: item.date
    });
    this.setState({recitems: newRecItems});
  }
  public getUserData() {
    this.props.context.msGraphClientFactory
      .getClient()
      .then((client: MSGraphClient): void => {
        client
          .api('/me')
          .get((error, user: MicrosoftGraph.User, rawResponse?: any) => {
            console.log(user);
            this.setState({
              userName: user.displayName
            });
          });
      });
  }
  public createEvent(item) {
    console.log(item);
    // let date = new Date(item.date+'T00:00:00');
    // console.log(date);
    // date.setDate(date.getDate()+1);
    // console.log(date.getDate());
    // let ndate = date.getFullYear()+'-'+date.getUTCMonth()+'-'+date.getDate();
    // console.log(ndate);
    this.props.context.msGraphClientFactory.getClient().then((client: MSGraphClient): void => {
      client.api('/me/events')
        .post({
          subject: item.title,
          body: {
            "contentType": "HTML",
          },
          start: {
            "dateTime": item.date,
            "timeZone": "UTC"
          },
          end: {
            "dateTime": item.date,
            "timeZone": "UTC"
          },
          location: {
            "displayName": "Skype for Business"
          },
          // isAllDay: true
        }, (err, res) => {
          console.log(res);
          alert("sent");
        });
    });
  }
  private addRecord(item, userName) {
    console.log('rab');
    let wep = new Web('https://cupcuper.sharepoint.com/sites/dev1');
    wep.lists.getById('a5558fa4-8101-4bd8-b487-d9cadfef789d'/*'5f0e9e0b-a4b4-457f-91fb-46a98119727e'*/).items.add({
      Title: item.title,
      EndDate: item.date,
      EventDate: item.date,
      UserName: userName
    });
  }
  private columsCreate(arraySelect: Array<any>): Array<IColumn> {
    const columns: IColumn[] = [];
    arraySelect.forEach((el, index) => {
      columns.push({
        key: `column${index}`,
        name: el,
        fieldName: el,
        minWidth: 70,
        maxWidth: 90,
        isResizable: true,
      });
    });
    return columns;
  }
  public componentDidMount() {
    this.getSearch();
    this.kinopoisk();
    this.getUserData();
    this.kinopoisk= this.kinopoisk.bind(this);
    this.createEvent = this.createEvent.bind(this);
    this.addTempItem = this.addTempItem.bind(this);
    // this.createEvent();
  }

  public render(): React.ReactElement<IAfishaProps> {
    return (
      <div className={styles.afisha} >
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.column}>
              <span className={styles.title}>Welcome to SharePoint!</span>
              <p className={styles.description}>{escape(this.props.description)}</p>
              <Covers
                events={this.state.events}
                calHandler={this.createEvent}
                recHandler={this.addRecord}
                userName={this.state.userName}
                currentDate={this.state.currentdate}
                kinopoisk={this.kinopoisk}
                addTempItem={this.addTempItem}
              />
              <DetailsList
                items={this.state.recitems}
                columns={this.state.columns}
                setKey="set"
                layoutMode={DetailsListLayoutMode.justified}
                isHeaderVisible={true}
                ariaLabelForSelectionColumn="Toggle selection"
                ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                checkButtonAriaLabel="Row checkbox"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
