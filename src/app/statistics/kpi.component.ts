import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {MatDialog, MatDialogRef} from '@angular/material'
import {MatSnackBar} from '@angular/material'
import {Router, ActivatedRoute} from '@angular/router'
import {Observable} from 'rxjs/Observable'
import {DatePipe} from '@angular/common'

@Component({
  selector: 'statistics-kpi',
  styles:[`
    table {
    color: #333;
    font-family: Helvetica, Arial, sans-serif;
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    }
    td, th {
    border: 1px solid transparent; /* No more visible border */
    height: 30px;
    transition: all 0.3s;
    }
    th {
    background: #DFDFDF;
    font-weight: bold;
    }
    td {
    background: #FAFAFA;
    text-align: center;
    }
    tr:nth-child(even) td { background: #F1F1F1; }
    tr:nth-child(odd) td { background: #FEFEFE; }
    tr td:hover { background: #673ab7; color: #FFF; }
    .workcenter-column{
    width: 100px;
    font-weight: bold;
    }
    `],
    templateUrl: './kpi.component.html',
})
export class KPIComponent{

  done: boolean = false
  operatorMap: any = {}
  workcenterMap: any = {}
  detailedSampleList: any[] = []
  queryDateStart: string = ''
  queryDateEnd: string = ''

  constructor(
    private entityService: EntityService,
    private snackBar: MatSnackBar,
  ){
  }

  ngOnInit(){
    let date = new Date()
    this.queryDateStart = new DatePipe('en-US').transform(new Date(date.getFullYear(), date.getMonth(), 1), 'yyyy-MM-dd')
    this.queryDateEnd = new DatePipe('en-US').transform(new Date(date.getFullYear(), date.getMonth() + 1, 0), 'yyyy-MM-dd')
    this.getSampleList()
  }
  getSampleList(){
    this.done = false

    this.detailedSampleList = []

    let options = ''
    if (this.queryDateStart != '') {
      options += '&completestart=' + this.queryDateStart
    }
    if (this.queryDateEnd != '') {
      options += '&completeend=' + this.queryDateEnd
    }


    this.entityService.retrieveBy({
      "SYS_IDENTIFIER": "/PRODUCT_WORKCENTER"
    })
    .subscribe(productWorkcenter => {
      this.entityService.retrieveEntity(productWorkcenter[0].id, "class")
      .subscribe(workcenterList => {
        let workcenterObs = []
        workcenterList
        .sort((a,b) => {
          return a.SYS_ORDER > b.SYS_ORDER
        })
        .forEach(workcenter => {

          // prepare for the sample counting
          this.workcenterMap[workcenter.id] = workcenter
          this.workcenterMap[workcenter.id]['TMP_OPERATOR_SAMPLE_LIST'] = {}
          this.workcenterMap[workcenter.id]['TMP_SAMPLE_LIST'] = []

          workcenterObs.push(
            this.entityService.retrieveEntity(workcenter.id, "collection", options)
            .map(data => {
              return {workcenter: workcenter, samples: data}
            })
          )
        })

        Observable.forkJoin(workcenterObs)
        .subscribe((resultList: any[][]) => {
          resultList.forEach(result => {
            let workcenter = result['workcenter']
            this.workcenterMap[workcenter.id]['TMP_SAMPLE_LIST'] = result['samples'].filter(sample => {
              //result['samples'].filter(sample => {
              if (sample.hasOwnProperty('SYS_WORKCENTER_OPERATOR')){
                let operatorId = sample['SYS_WORKCENTER_OPERATOR']

                this.operatorMap[operatorId] = true

                if (!this.workcenterMap[workcenter.id]['TMP_OPERATOR_SAMPLE_LIST'][operatorId]){
                  this.workcenterMap[workcenter.id]['TMP_OPERATOR_SAMPLE_LIST'][operatorId] = []
                }
                this.workcenterMap[workcenter.id]['TMP_OPERATOR_SAMPLE_LIST'][operatorId].push(sample)

                return true
              } else {
                return false
              }
            })
          })
          this.done = true
        })
      })
    })
  }

  showDetail(sampleList: any[]){
    this.detailedSampleList = sampleList
  }
}
