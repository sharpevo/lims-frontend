import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {MdDialog, MdDialogRef} from '@angular/material'
import {SampleFormDialog} from '../workcenter/form.dialog.component'

@Component({
  selector: 'sample-history',
  templateUrl: './history.component.html',
})

export class SampleHistoryComponent {
  @Input() sample: any
  @Input() selectedSampleList: any[]
  sampleMap: any = {}
  workcenterList: any[] = []

  entity: any = {}

  sampleList: any[] = []

  public lineChartData: any[] = []
  public lineChartLabels:Array<any> = []
  public lineChartOptions:any = {
    labelFontColor : "#666",
    scaleFontColor: "green",
    responsive: true,
    hover: {
      mode: "nearest",
      intersec: true,
    },
    interaction: {
      mode: "nearest",
    },
    scales: {
      yAxes: [
        {
          id: 'y-axis-1',
          display: true,
          position: 'left',
          ticks: {
            beginAtZero: false,
            stepSize: 1,
            callback: (label, index, labels) => {
              return this.sample['SYS_SAMPLE_CODE'] + '-' + label
            }
          },
        }
      ],
      xAxes: [{
        type: 'linear',
        position: 'bottom',
        ticks:{
          callback: (label, index, labels) => {
            return this.lineChartLabels[label-1]
          }
        }
      }]
    },
    tooltips: {
      callbacks: {
        label: function(tooltipItem, data) {
          let sample = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].sample
          let terminatedDate = new Date(sample.SYS_DATE_TERMINATED).toDateString()
          let completedDate = new Date(sample.SYS_DATE_COMPLETED).toDateString()
          return `id: ${sample.id} completed: ${completedDate} terminated: ${terminatedDate}`
        }
      }
    },
    animation: {
      duration: 1,
      onComplete: function () {
        var chartInstance = this.chart,
          ctx = chartInstance.ctx;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = '#aaa';

        this.data.datasets.forEach(function (dataset, i) {
          var meta = chartInstance.controller.getDatasetMeta(i);
          meta.data.forEach(function (bar, index) {
            var data = dataset.data[index]
            ctx.fillText(data.scheduledDate, bar._model.x, bar._model.y - 5);
          });
        });
      }
    }
  };
  public lineChartLegend:boolean = true;
  public lineChartType:string = 'line';

  constructor(
    public dialog: MdDialog,
    private entityService: EntityService
  ){}

  ngOnInit(){
    this.getWorkcenterList()
    this.entityService.retrieveByIdentifierFull(
      "/PROJECT_MANAGEMENT/GENERAL_PROJECT")
      .subscribe(data => {
        this.entity = data[0]
      })
  }

  getWorkcenterList(){
    this.entityService.retrieveBySortBy(
      {"where":'{"SYS_IDENTIFIER": {"regex":"^/PRODUCT_WORKCENTER"},"SYS_ENTITY_TYPE": {"=":"class"}}',
      },
      "ORDER")
      .subscribe(data => {
        this.workcenterList = data
        this.workcenterList.forEach(workcenter => {
          this.lineChartLabels.push(workcenter[workcenter['SYS_LABEL']])
        })
        // get sample after workcenter
        this.getSampleMap()
      })
  }

  getSampleMap() {
    this.entityService.retrieveBySortBy(
      {'SYS_SAMPLE_CODE': this.sample['SYS_SAMPLE_CODE']},
      //"createdAt")
      "SYS_DATE_SCHEDULED")
      .subscribe(data => {

        data.forEach(sample => {

          // only minions without the master
          if (sample['SYS_TARGET']){
            if (!this.sampleMap[sample['SYS_TARGET']]){
              this.sampleMap[sample['SYS_TARGET']] = []
            }

            //console.log("#", sample.SYS_IDENTIFIER, sample.SYS_TARGET)
            this.sampleMap[sample['SYS_TARGET']].push(sample)
          }

        })

        let i=0
        Object.keys(this.sampleMap).sort().forEach(key => {
          i += 1
          let dataSetLabel = this.sampleMap[key][0][this.sampleMap[key][0]['SYS_LABEL']] + '-' + i
          let chartData = {
            data:[],
            fill:false,
            pointRadius: 6,
            pointHoverRadius: 10,
            label: dataSetLabel,
            pointStyle:[],
          }

          let j = 0

          let offset = 0
          this.workcenterList.forEach(workcenter => {
            if (!this.sampleMap[key][j]){
              chartData.data.push(i-1)
            } else {
              //console.log("--- " + j + " ---", this.sampleMap[key][j].SYS_SAMPLE_CODE, ": ", this.sampleMap[key][j].SYS_TARGET)
              let workcenterIdentifier = workcenter['SYS_IDENTIFIER']
              let sampleGenreIdentifier = this.sampleMap[key][j]['SYS_GENRE_IDENTIFIER']
              //console.log("S:", sampleGenreIdentifier)
              //console.log("W:", workcenterIdentifier)
              if (workcenterIdentifier + '/' == sampleGenreIdentifier){
                j+=1
                //console.log("==", j+offset, i)
                //chartData.data.push({x:j+offset,y:i, r:5})
                let scheduledDate = new Date(this.sampleMap[key][j-1]['SYS_DATE_SCHEDULED'])
                chartData.data.push({
                  x:j+offset,
                  y:i,
                  sample: this.sampleMap[key][j-1],
                  sampleId:this.sampleMap[key][j-1]['id'],
                  //scheduledDate: scheduledDate.getFullYear() + '-' + scheduledDate.getMonth() + '-' + scheduledDate.getDate(),
                  scheduledDate: (scheduledDate.getMonth()+1) + '月' + scheduledDate.getDate() + '日',
                })

                if (this.sampleMap[key][j-1]['SYS_DATE_TERMINATED']){
                  chartData.pointStyle.push('triangle')
                } else {
                  chartData.pointStyle.push('circle')
                }
              } else {
                offset += 1
                //console.log("!=", offset)
                //console.log("!=", i-1)
                //chartData.data.push(i-1)
              }
            }

          })

          //console.log(chartData.data)
          this.lineChartData.push(chartData)
        })

      })

  }

  // what a pity solution
  getSampleKeys(){
    return Object.keys(this.sampleMap)
  }

  public chartClicked(eventObject: any){
    if (eventObject.active.length > 0){
      let datasetIndex = eventObject.active[0]._datasetIndex
      let sampleIndex = eventObject.active[0]._index
      let sample = this.lineChartData[datasetIndex].data[sampleIndex].sample
      this.openNewEntityDialog(sample)
    }
  }

  public chartHovered(e:any):void {
    console.log(e);
  }

  openNewEntityDialog(sample: any) {
    let dialogRef = this.dialog.open(SampleFormDialog, {height: '850px', width: '600px'});
    dialogRef.componentInstance.config.entity = this.entity
    dialogRef.componentInstance.config.issueSample = true
    dialogRef.componentInstance.config.sampleList = [sample]
    dialogRef.afterClosed().subscribe(result => {
      this.sampleMap = {}
      this.lineChartData = []
      this.getSampleMap()
    });
  }
}