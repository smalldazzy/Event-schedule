import * as React from 'react';
import styles from './Afisha.module.scss';
import { IAfishaProps } from './IAfishaProps';
import { escape } from '@microsoft/sp-lodash-subset';
import pnp, { Web, sp } from 'sp-pnp-js';
import { DetailsList, DetailsListLayoutMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import Covers from './Covers';
import Covers2 from './Covers2';
import { MSGraphClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { Client } from '@microsoft/microsoft-graph-client';
import { string } from 'prop-types';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { tenantUrl, listId } from '../constants';

interface IrecItem {
  UserName: string;
  Title: string;
  EventDate: string;
  EndDate: string;
  ListItemID: string;
}
interface IAfishaState {
  columns: Array<any>;
  recitems: Array<IrecItem>;
  events: Array<any>;
  userName: string;
  currentdate: Date;
}
export default class Afisha extends React.Component<IAfishaProps, IAfishaState> {
  public state = {
    columns: this.columsCreate(['UserName', 'Title', 'EventDate', 'EndDate']),
    recitems: [],
    events: [],
    userName: '',
    currentdate: new Date()
  };
  private getSearch() {
    let url = `${tenantUrl}/search/_api/search/query?querytext='${listId}'&selectproperties='Title%2c+EventDateOWSDate%2c+EndDateOWSDate%2c+RefinableString50%2c+ListItemID'&clienttype='ContentSearchRegular'`;
    // let url = `https://cupcuper.sharepoint.com/search/_api/search/query?querytext='a5558fa4-8101-4bd8-b487-d9cadfef789d'&selectproperties='Title%2cEventDateOWSDate%2cEndDateOWSDate'&clienttype='ContentSearchRegular'`;
    fetch(url, {
      method: 'get',
      headers: {
        'accept': "application/json;odata=verbose",
        'content-type': "application/json;odata=verbose",
      }
    }).then((response) => response.json()).then((d) => {
      let arr = d.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results.slice(1);
      console.log(arr);
      let viewlist = [];
      arr.forEach((item) => {
        viewlist.push({
          UserName: item.Cells.results[5].Value.trim(), //откуда пробелы в refstring50?
          Title: item.Cells.results[2].Value,
          EventDate: item.Cells.results[3].Value,
          EndDate: item.Cells.results[4].Value,
          ListItemID: item.Cells.results[6].Value
        });
      });
      this.setState({ recitems: viewlist });
    }
    ).then(() => this.setLsRecords());
    console.log('New data list fetched');
  }
  private kinopoisk() {
    console.log('Fetching events from api');
    let newDate = this.state.currentdate.toISOString().split('T')[0];
    let uri = `https://api.themoviedb.org/3/discover/movie?primary_release_date.gte=${newDate}&primary_release_date.lte=${newDate}`;
    // let url = `https://cors-anywhere.herokuapp.com/https://api.themoviedb.org/3/movie/now_playing/`;
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
        r.results.slice(0, 3).forEach((item) => {
          events.push({
            id: item.id,
            title: item.title,
            imgurl: item.poster_path,
            date: item.release_date,
          });
        });
        this.setState({ events: events }, () => this.setLsEvents());
      });
  }
  public addTempItem(item, userName) {
    console.log('Adding new item');
    let newRecItems = this.state.recitems;
    newRecItems.push({
      UserName: userName,
      Title: item.title,
      EventDate: item.date,
      EndDate: item.date
    });
    this.setState({ recitems: newRecItems }, () => this.setLsRecords());
  }
  public getUserData() {
    this.props.clientFactory
      .getClient()
      .then((client: MSGraphClient): void => {
        client
          .api('/me')
          .get((error, user: MicrosoftGraph.User, rawResponse?: any) => {
            this.setState({
              userName: user.displayName
            });
          });
      });
  }

  public createEvent(item) {
    console.log(item);
    this.props.clientFactory.getClient().then((client: MSGraphClient): void => {
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
          alert("Event added to your Outlook calendar");
        });
    });
  }
  private findIdCAML(Title: string, UserName: string){
    let wep = new Web(`${tenantUrl}/sites/dev1`);
    // let query = "<Where><And><Eq><FieldRef Name='UserName'/><Value Type='Text'>Олег Куприянов</Value></Eq><Eq><FieldRef Name='Title'/><Value Type='Text'>Overcomer</Value></Eq></And></Where>";
    let query = `<Where><And><Eq><FieldRef Name='UserName'/><Value Type='Text'>${UserName}</Value></Eq><Eq><FieldRef Name='Title'/><Value Type='Text'>${Title}</Value></Eq></And></Where>`;
    const xml = '<View><Query>' + query + '</Query></View>';  
    // const xml = "<View><ViewFields><FieldRef Name='UserName' /><FieldRef Name='Title' /></ViewFields><Query><OrderBy><FieldRef Name='Title' /></OrderBy></Query></View>";
    wep.lists.getById(listId).getItemsByCAMLQuery({'ViewXml':xml}).then((res) => {
      console.log(res[0].ID);
      if(res[0].ID>0) {
        this.delFromSPL(res[0].ID);
      }
    });

  }
  private findStatusCAML(Title: string, UserName: string){
    let wep = new Web(`${tenantUrl}/sites/dev1`);
    // let query = "<Where><And><Eq><FieldRef Name='UserName'/><Value Type='Text'>Олег Куприянов</Value></Eq><Eq><FieldRef Name='Title'/><Value Type='Text'>Overcomer</Value></Eq></And></Where>";
    let query = `<Where><And><Eq><FieldRef Name='UserName'/><Value Type='Text'>${UserName}</Value></Eq><Eq><FieldRef Name='Title'/><Value Type='Text'>${Title}</Value></Eq></And></Where>`;
    const xml = '<View><Query>' + query + '</Query></View>';  
    // const xml = "<View><ViewFields><FieldRef Name='UserName' /><FieldRef Name='Title' /></ViewFields><Query><OrderBy><FieldRef Name='Title' /></OrderBy></Query></View>";
     return wep.lists.getById(listId).getItemsByCAMLQuery({'ViewXml':xml}).then((res) => {
       if (res[0]!==undefined){
      // console.log(res[0].btnStatus);
          return (res[0].btnStatus);
       } 
    });
  }
  private addRecord(item, userName,btnStatus) {
    let wep = new Web(`${tenantUrl}/sites/dev1`);
    wep.lists.getById(listId).items.add({
      Title: item.title,
      EndDate: item.date,
      EventDate: item.date,
      UserName: userName,
      btnStatus: btnStatus
    });
  }
  private getSp() {
    let wep = new Web(`${tenantUrl}/sites/dev1`);
    wep.lists.getById(listId).items.get().then((r) => console.log(r));
  }
  public findRecord(UserName: string, Title: string) {
    let founded: IrecItem = this.state.recitems.find((element: IrecItem, index: number) => {
      if (element.UserName === UserName && element.Title === Title) {
        console.log('found! index', element.ListItemID);
        return true;
      }
    });
    console.log(founded.ListItemID);
  }
  private delFromSPL(itemId: number) {
    let wep = new Web(`${tenantUrl}/sites/dev1`);
    wep.lists.getById(listId).items.getById(itemId).delete().then(_ => { });
  }
  private delFromList(eventTitle: string, userName: string) {
    let indexx: number;
    let found = this.state.recitems.find((item: IrecItem, index: number) => {
      if (item.Title === eventTitle && item.UserName === userName) {
        console.log(index);
        indexx = index;
        return true;
      }
    });
    if (found) {
      console.log(found.ListItemID);
      this.findIdCAML(eventTitle, userName);
      this.state.recitems.splice(indexx, 1);
    };
    // let arr = this.state.recitems.slice(0);
    // if (indexx!=undefined) {
    //   arr.splice(indexx, 1);
      // console.log(arr);
      console.log(this.state.recitems);
      this.setLsRecords();
    
   
  }
  private setLsRecords() {
    let savedRecords = {
      time: Date.now(),
      records: this.state.recitems
    };
    localStorage.setItem('records', JSON.stringify(savedRecords));
  }
  private setLsEvents() {
    if (this.state.currentdate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]) {
      let savedEvents = this.state.events;
      localStorage.setItem('events', JSON.stringify(savedEvents));
    }
  }
  private getLsEvents() {
    let saved = JSON.parse((localStorage.getItem('events'))) || null;
    if (saved !== null) {
      if (this.state.currentdate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]) {
        console.log('Fetching events from localstorage');
        this.setState({ events: saved });
      } else {
        this.kinopoisk();
      }
    } else {
      this.kinopoisk();
    }
  }
  private getLsRecords() {
    let saved = JSON.parse((localStorage.getItem('records'))) || null;
    if (saved !== null) {
      console.log(saved);
      let diff = (Date.now() - saved.time);
      console.log((Date.now() - saved.time));
      if (diff > 900000) { //15min in ms
        this.getSearch();
      } else {
        this.setState({ recitems: saved.records });
      }
    } else {
      this.getSearch();
    }
  }
  private attendClick(item, username: string, btnStatus) {
    // this.createEvent(item); remove comment for adding to outlook calendar
    this.addRecord(item, username, btnStatus);
    this.addTempItem(item, username);
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
    this.getLsEvents();
    this.getLsRecords();
    this.getUserData();
    this.kinopoisk = this.kinopoisk.bind(this);
    this.getLsEvents = this.getLsEvents.bind(this);
    this.attendClick = this.attendClick.bind(this);
    this.delFromList = this.delFromList.bind(this);
    this.findStatusCAML = this.findStatusCAML.bind(this);
    // this.findIdCAML('Overcomer','Олег Куприянов');
    // this.findStatusCAML('Overcomer','Олег Куприянов');
    // this.getSp();
  }

  public render(): React.ReactElement<IAfishaProps> {
    return (
      <div className={styles.afisha} >
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.column}>
              <span className={styles.title}>Welcome to SharePoint!</span>
              <p className={styles.description}>Events for {this.state.currentdate.toISOString().split('T')[0]}</p>
              {/* <Covers
                events={this.state.events}
                userName={this.state.userName}
                currentDate={this.state.currentdate}
                kinopoisk={this.getLsEvents}
                attendHandler={this.attendClick}
                interestHandler={this.delFromList}
                findStatusCAML={this.findStatusCAML}
              /> */}
              <Covers2
                events={this.state.events}
                userName={this.state.userName}
                currentDate={this.state.currentdate}
                kinopoisk={this.getLsEvents}
                attendHandler={this.attendClick}
                interestHandler={this.delFromList}
                findStatusCAML={this.findStatusCAML}
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
