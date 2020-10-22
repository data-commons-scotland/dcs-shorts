import React from 'react';

import {
  PivotGrid,
  FieldChooser,
  Scrolling,
  Export
} from 'devextreme-react/pivot-grid';
import { DataGrid, Column } from 'devextreme-react/data-grid';
import { Popup } from 'devextreme-react/popup';
import PivotGridDataSource from 'devextreme/ui/pivot_grid/data_source';
import { createStore } from 'devextreme-aspnet-data-nojquery';

import Chart, {
  AdaptiveLayout,
  Legend,
  CommonSeriesSettings,
  Point,
  Size,
  Margin,
  ZoomAndPan,
  Tooltip,
  Export as ChartExport
} from 'devextreme-react/chart';

import Button from 'devextreme-react/button';

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      popupTitle: '',
      drillDownDataSource: null,
      popupVisible: false
    };
    this.onCellClick = this.onCellClick.bind(this);
    this.onHiding = this.onHiding.bind(this);
    this.onShown = this.onShown.bind(this);
    this.getDataGridInstance = this.getDataGridInstance.bind(this);

    this.resetZoom = () => {
      this._chart.resetVisualRange();
    };
  }

  componentDidMount() {
      this._pivotGrid.bindChart(this._chart, {
        dataFieldsDisplayMode: 'splitPanes',
        alternateDataFields: false
      });
  }


  chart() {
    return(<Chart
              ref={(ref) => this._chart = ref.instance}
              palette="Harmony Light"
              title="Household waste in Scotland"
           >
                    <Size height={500} />
                    <Tooltip enabled={true} customizeTooltip={customizeTooltip} />
                    <Legend
                      verticalAlignment="center"
                      horizontalAlignment="right"
                    />
                    <CommonSeriesSettings type={chartType} width="1">
                      <Point size="6" />
                    </CommonSeriesSettings>
                    <AdaptiveLayout  width={0} height={0} />
                    <Margin bottom={10} />
                    <ChartExport enabled={true} fileName="household-waste" />
                    <ZoomAndPan
                      valueAxis="both"
                      argumentAxis="both"
                      dragToZoom={true}
                      allowMouseWheel={true}
                      panKey="shift" />
                  </Chart>);
  }

  render() {
    let { drillDownDataSource, popupTitle, popupVisible } = this.state;

    return (
      <React.Fragment>

        {this.chart()}

        <div className='block centre'>
          <div className='buttonAreaMargins'>
            <Button
              id="reset-chart-zoom"
              text="Unzoom chart"
              onClick={this.resetZoom}
            ></Button>
          </div>
        </div>

        <PivotGrid
          id="pivotGrid"
          allowSortingBySummary={true}
          allowSorting={true}
          allowFiltering={true}
          allowExpandAll={true}
          height={560}
          showBorders={true}
          dataSource={dataSource}
          onCellClick={this.onCellClick}
          showColumnGrandTotals={false}
          showRowGrandTotals={false}
          //rowHeaderLayout={"tree"}
          //hideEmptySummaryCells={true}
          ref={(ref) => this._pivotGrid = ref.instance}
        >
          <FieldChooser enabled={true} />
          <Scrolling mode="virtual" />
          <Export enabled={true} allowExportSelectedData={true} fileName="household-waste" />
        </PivotGrid>

        <Popup
          visible={popupVisible}
          title={popupTitle}
          onHiding={this.onHiding}
          onShown={this.onShown}
        >
          <DataGrid
            dataSource={drillDownDataSource}
            ref={this.getDataGridInstance}
          >
            <Column dataField="year" dataType="year" />
            <Column dataField="area" />
            <Column dataField="endState" />
            <Column dataField="material" />
            <Column dataField="tonnes" dataType="number" format="decimal" />
            <Column dataField="tonnesPerCitizen" dataType="number" format="decimal" />
            <Column dataField="tonnesPerHousehold" dataType="number" format="decimal" />
          </DataGrid>
        </Popup>

      </React.Fragment>
    );
  }

  getDataGridInstance(ref) {
    this.dataGrid = ref.instance;
  }

  onCellClick(e) {
    if (e.area === 'data') {
      var pivotGridDataSource = e.component.getDataSource(),
        rowPathLength = e.cell.rowPath.length,
        rowPathName = e.cell.rowPath[rowPathLength - 1];

      this.setState({
        popupTitle: `${rowPathName ? rowPathName : 'Total'} Drill Down Data`,
        drillDownDataSource: pivotGridDataSource.createDrillDownDataSource(e.cell),
        popupVisible: true
      });
    }
  }

  onHiding() {
    this.setState({
      popupVisible: false
    });
  }

  onShown() {
    this.dataGrid.updateDimensions();
  }
}

var fieldsConfig = [{
                 caption: 'Area',
                 width: 90,
                 dataField: 'area',
                 area: 'row',
                 filterType: 'exclude',
                 filterValues: [
                   'Scotland'
                 ]
               },
               {
                 caption: 'End state',
                 width: 90,
                 dataField: 'endState',
                 area: 'row',
                 filterType: 'exclude',
                 filterValues: [
                   'Waste Generated',
                   'Other Diversion (pre 2014 method)',
                   'Recycled (pre 2014 method)'
                 ]
               }, {
                 caption: 'Material',
                 dataField: 'material',
                 width: 90,
                 area: 'row',
                 filterType: 'exclude',
                 filterValues: [
                   'Total Waste'
                 ]
               }, {
                 dataField: 'year',
                 dataType: 'year',
                 area: 'column',
                 filterType: 'exclude',
                 filterValues: [ 2011, 2012, 2013 ]
               }, {
                 caption: 'Tonnes of solids',
                 dataField: 'tonnes',
                 dataType: 'number',
                 summaryType: 'sum',
                 format: 'decimal'
               },
               {
                 caption: 'Tonnes of solids per citizen',
                 dataField: 'tonnesPerCitizen',
                 dataType: 'number',
                 summaryType: 'sum',
                 format: {
                   precision: 5,
                   type: "fixedPoint"
                 },
                 area: 'data'
               },
               {
                 caption: 'Tonnes of solids per household',
                 dataField: 'tonnesPerHousehold',
                 dataType: 'number',
                 summaryType: 'sum',
                 format: {
                   precision: 5,
                   type: "fixedPoint"
                 }
               }];

var chartType = "line";

switch(window.location.pathname){
    case("/preset1"): // compare tonnes landfilled per Aberdeen City/Dundee/Scottish citizen per year
        fieldsConfig = fieldsConfig
            .map(o => {
                if (o.dataField==="area") {
                    o.filterType = 'include'
                    o.filterValues = ['Aberdeen City', 'Dundee City', 'Scotland'];
                    o.expanded = true;
                }
                return o; })
            .map(o => {
                if (o.dataField==="endState") {
                    o.filterType = 'include'
                    o.filterValues = ['Landfilled'];
                }
                return o; });
        break;
    case("/preset2"): // tonnes per end-state per material for Stirling in 2018
            fieldsConfig = fieldsConfig
                .map(o => {
                    if (o.dataField==="tonnes") {
                        o.area = "data";
                    }
                    return o; })
                .map(o => {
                    if (o.dataField==="tonnesPerCitizen") {
                        o.area = null;
                    }
                    return o; })
                .map(o => {
                    if (o.dataField==="area") {
                        o.filterType = 'include'
                        o.filterValues = ['Stirling'];
                        o.expanded = true;
                    }
                    return o; })
                .map(o => {
                    if (o.dataField==="endState") {
                        o.filterType = 'include'
                        o.filterValues = ['Recycled', 'Other Diversion', 'Landfilled'];
                        o.expanded = true;
                    }
                    return o; })
                .map(o => {
                    if (o.dataField==="year") {
                        o.filterType = 'include'
                        o.filterValues = [2018];
                     }
                     return o; });
            chartType = "bar";
            break;
    default:
        // no op
}

const dataSource = new PivotGridDataSource({
  fields: fieldsConfig,
  store: createStore({
    loadUrl: '/dx-data.json'
  })
});

function customizeTooltip(arg) {
  return {
    html: `${arg.argumentText}<br/>${arg.seriesName}<br/>${arg.valueText}`
  };
}

export default App;



