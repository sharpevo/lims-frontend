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

  sampleList: any[] = []

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

              //if (label == index){
              return this.sample['SYS_SAMPLE_CODE'] + '-' + label
              //}
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
    //this.lineChartData = []

    this.entityService.retrieveBySortBy(
      {'SYS_SAMPLE_CODE': this.sample['SYS_SAMPLE_CODE']},
      //"createdAt")
      "SYS_DATE_SCHEDULED")
      .subscribe(data => {

        data.forEach(sample => {

          // only minions without the master
          if (sample['SYS_TARGET']){
            if (!this.sampleMatrix[sample['SYS_TARGET']]){
              this.sampleMatrix[sample['SYS_TARGET']] = {}
            }
            if (!this.sampleMap[sample['SYS_TARGET']]){
              this.sampleMap[sample['SYS_TARGET']] = []
            }

            //console.log("#", sample.SYS_IDENTIFIER, sample.SYS_TARGET)
            this.sampleMap[sample['SYS_TARGET']].push(sample)

            if (!this.sampleMatrix[sample['SYS_TARGET']][sample['SYS_GENRE_IDENTIFIER']]){
              this.sampleMatrix[sample['SYS_TARGET']][sample['SYS_GENRE_IDENTIFIER']] = sample
            } else {
              console.error("same sample treated more than one time.")
            }

          }



        })

        let i=0
        Object.keys(this.sampleMatrix).sort().forEach(key => {
          console.log("-------",key)
          let chartData = {
            data:[],
            fill:false,
            pointRadius: 5,
            pointHoverRadius: 7,
            label:key,
          }
          i += 1

          //Object.keys(this.sampleMatrix[key]).forEach(sampleKey => {
          ////chartData.data.push(this.sampleMatrix[key][sampleKey]['SYS_SAMPLE_CODE'])
          //console.log("---")
          //console.log("s", sampleKey)

          //if (this.workcenterList[chartData.data.length]){

          //if (sampleKey == this.workcenterList[chartData.data.length]['SYS_IDENTIFIER'] + '/'){
          //chartData.data.push(i)
          //} else {
          //console.log("w", this.workcenterList[chartData.data.length]['SYS_IDENTIFIER'])
          //chartData.data.push(i-1)
          //}
          //}
          //})

          let j = 0

          this.workcenterList.forEach(workcenter => {
            if (!this.sampleMap[key][j]){
              //console.log("xxx")
              chartData.data.push(i-1)
            } else {
              //console.log("--- " + j + " ---", this.sampleMap[key][j].SYS_SAMPLE_CODE, ": ", this.sampleMap[key][j].SYS_TARGET)
              let workcenterIdentifier = workcenter['SYS_IDENTIFIER']
              let sampleGenreIdentifier = this.sampleMap[key][j]['SYS_GENRE_IDENTIFIER']
              //console.log("S:", sampleGenreIdentifier)
              //console.log("W:", workcenterIdentifier)
              if (workcenterIdentifier + '/' == sampleGenreIdentifier){
                j+=1
                //console.log("==", i)
                chartData.data.push(i)
              } else {
                //console.log("!=", i-1)
                chartData.data.push(i-1)
              }
            }

          })

          //this.sampleMap[key].forEach(sample => {
          //j += 1
          //console.log("--- " + j + " ---", sample.SYS_SAMPLE_CODE, ": ", sample.SYS_TARGET)
          //if (this.workcenterList[chartData.data.length]){
          //console.log("s '", sample['SYS_GENRE_IDENTIFIER'], "'")
          //console.log("w '", this.workcenterList[chartData.data.length]['SYS_IDENTIFIER'] + '/', "'")
          //if (sample['SYS_GENRE_IDENTIFIER'] == this.workcenterList[chartData.data.length]['SYS_IDENTIFIER'] + '/'){
          //console.log("=", i)
          //chartData.data.push(i)
          //} else {
          //console.log("!=", i-1)
          //chartData.data.push(i-1)
          //}
          //}
          //})

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
      let lastSampleIndex = e.active.length - 1
      // sampleIndex actually, since the workcenter may not be chose by the sample
      let sampleIndex = e.active[lastSampleIndex]._index
      let dataIndex = e.active[lastSampleIndex]._chart.config.data.datasets[lastSampleIndex].data[sampleIndex]
      let workcenterLabel = e.active[lastSampleIndex]._chart.config.data.labels[sampleIndex]
      let targetId = Object.keys(this.sampleMatrix)[dataIndex-1]
      let sampleKey = Object.keys(this.sampleMatrix[targetId])[sampleIndex]
      console.log("index:", sampleIndex)
      console.log("dataIndex:", dataIndex)
      console.log("label:", targetId)
      console.log("workcenter:", this.workcenterList[sampleIndex]['label'])
      //console.log("sample:", Object.keys(this.sampleMatrix[targetId])[sampleIndex])
      console.log(this.sampleMatrix[targetId][sampleKey])
      //let sample = this.sampleMatrix[targetId][sampleKey]
      let sample = this.sampleMap[targetId][this.sampleMap[targetId].length - this.workcenterList.length + sampleIndex]
      console.log("sample:", sample['SYS_IDENTIFIER'], dataIndex)
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
