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
  sampleMatrix: any = {}
  workcenterList: any[] = []

  entity: any = {}

  public lineChartData: any[] = []
  public lineChartLabels:Array<any> = []
  public lineChartOptions:any = {
    responsive: true,
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

              if (label == index){
                return this.sample['SYS_SAMPLE_CODE'] + '-' + label
              }
            }
          },
          //scaleLabel:{
          //display: true,
          //labelString: 'Experiment Path',
          //fontColor: "#546372"
          //}
        }
      ]
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
    this.getSampleMap()
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
      })
  }

  getSampleMap() {
    this.lineChartData = []

    this.entityService.retrieveBySortBy(
      {'SYS_SAMPLE_CODE': this.sample['SYS_SAMPLE_CODE']},
      "createdAt")
      .subscribe(data => {

        data.forEach(sample => {

          // only minions without the master
          if (sample['SYS_TARGET']){
            if (!this.sampleMatrix[sample['SYS_TARGET']]){
              this.sampleMatrix[sample['SYS_TARGET']] = {}
            }

            if (!this.sampleMatrix[sample['SYS_TARGET']][sample['SYS_GENRE_IDENTIFIER']]){
              this.sampleMatrix[sample['SYS_TARGET']][sample['SYS_GENRE_IDENTIFIER']] = sample
            } else {
              console.error("same sample treated more than one time.")
            }

          }



        })

        let i=0
        Object.keys(this.sampleMatrix).forEach(key => {
          let chartData = {
            data:[],
            fill:false,
            pointRadius: 5,
            pointHoverRadius: 7,
            label:key,
          }
          i++

            Object.keys(this.sampleMatrix[key]).forEach(sampleKey => {
            //chartData.data.push(this.sampleMatrix[key][sampleKey]['SYS_SAMPLE_CODE'])
            chartData.data.push(i)
          })
          this.lineChartData.push(chartData)

        })

      })

  }

  getTargetSampleIds(){
    return Object.keys(this.sampleMatrix)
  }

  // what a pity solution
  getSampleKeys(){
    return Object.keys(this.sampleMap)
  }

  // events
  public chartClicked(e:any):void {

    // only take the top line, as the latest sample
    if (e.active.length > 0){
      // sampleIndex actually, since the workcenter may not be chose by the sample
      let workcenterIndex = e.active[0]._index
      let dataIndex = e.active[0]._chart.config.data.datasets[0].data[e.active[0]._index]
      let workcenterLabel = e.active[0]._chart.config.data.labels[e.active[0]._index]
      let targetId = Object.keys(this.sampleMatrix)[dataIndex-1]
      let sampleKey = Object.keys(this.sampleMatrix[targetId])[workcenterIndex]
      console.log("label:", targetId)
      console.log("workcenter:", this.workcenterList[workcenterIndex]['label'])
      console.log("sample:", Object.keys(this.sampleMatrix[targetId])[workcenterIndex])
      console.log(this.sampleMatrix[targetId][sampleKey])
      let sample = this.sampleMatrix[targetId][sampleKey]
      this.openNewEntityDialog(sample)

    }
  }

  public chartHovered(e:any):void {
    console.log(e);
  }

  openNewEntityDialog(sample: any) {
    let dialogRef = this.dialog.open(SampleFormDialog, {width: '600px'});
    dialogRef.componentInstance.config.entity = this.entity
    dialogRef.componentInstance.config.issueSample = true
    dialogRef.componentInstance.config.sampleList = [sample]
    dialogRef.afterClosed().subscribe(result => {
    });
  }
}
