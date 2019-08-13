import * as React from 'react';
import styles from './Afisha.module.scss';
import { IAfishaProps } from './IAfishaProps';
import { escape } from '@microsoft/sp-lodash-subset';
import pnp, { Web, sp } from 'sp-pnp-js';
import { DetailsList, DetailsListLayoutMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';


export default class Afisha extends React.Component<IAfishaProps, {}> {
  public state = {
    columns: this.columsCreate(['Title', 'EventDate', 'EndDate']),
    recitems: []
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
    fetch(url, {
      method: 'get',
      headers: {
        'accept': "application/json;odata=verbose",
        'content-type': "application/json;odata=verbose",
      }
    }).then((response) => response.json()).then((d) => {
      console.log(d.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results.slice(1));
      let arr = d.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results.slice(1);
      let viewlist = [];
      arr.forEach((item) => {
        console.log(item.Cells.results);
        console.log(item.Cells.results[2].Value);
        viewlist.push({
          Title: item.Cells.results[2].Value,
          EventDate: item.Cells.results[3].Value,
          EndDate: item.Cells.results[4].Value
        });
      });
      console.log(viewlist);
      this.setState({ recitems: viewlist });

      // this.getList(d.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results[0].Cells.results[2].Value);
    }
    );
  }
  private kinopoisk() {
    let date = new Date().toISOString();
    console.log(date);
    let url = `https://api-gate2.movieglu.com/filmsNowShowing/?n=10`;
    fetch(url, {
      method: 'get',
      // mode: 'no-cors',
      headers: {
        'client': "LDRS",
        'x-api-key' : "iAiMm4HhK33kBtOyrrG74D12j9o3N1J4k5Lt0D8j",
        'territory': "UK",
        'authorization': "Basic TERSUzp1clI0RFZvV2ZGdEE=",
        'api-version' : "v200",
        'geolocation' : "52.123;0.456",
        'device-datetime': date
      }
    }).then((r)=>console.log(r));
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
    // this.kinopoisk();
  }
  public render(): React.ReactElement<IAfishaProps> {
    return (
      <div className={styles.afisha} >
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.column}>
              <span className={styles.title}>Welcome to SharePoint!</span>
              <p className={styles.description}>{escape(this.props.description)}</p>
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
