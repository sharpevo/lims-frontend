import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {MdDialog, MdDialogRef} from '@angular/material'
import {MdSnackBar} from '@angular/material'
import {Router, ActivatedRoute} from '@angular/router'
import {Observable} from 'rxjs/Rx'

@Component({
  selector: 'statistics-kpi',
  templateUrl: './kpi.component.html',
})
export class KPIComponent{

  workcenterList: any[] = []
  operatorMap: any = {}
  workcenterMap: any = {}

  constructor(
    private entityService: EntityService,
    private snackBar: MdSnackBar,
  ){
  }

  ngOnInit(){
    this.entityService.retrieveBy({
      "SYS_IDENTIFIER": "/PRODUCT_WORKCENTER"
    }).subscribe(productWorkcenter => {
      this.entityService.retrieveEntity(productWorkcenter[0].id, "class")
      .subscribe(workcenterList => {
        let workcenterObs = []
        //this.workcenterList = workcenterList
        workcenterList.forEach(workcenter => {
          workcenterObs.push(
            this.entityService.retrieveEntity(workcenter.id, "collection")
            .map(data => {
              return {workcenter: workcenter, samples: data}
            })
          )
        })

        Observable.forkJoin(workcenterObs)
        .subscribe((resultList: any[][]) => {
          resultList.forEach(result => {
            let workcenter = result['workcenter']
            workcenter['TMP_SAMPLE_LIST'] = result['samples'].filter(sample => {
              //result['samples'].filter(sample => {
              if (sample.hasOwnProperty('SYS_WORKCENTER_OPERATOR')){
                let operatorId = sample['SYS_WORKCENTER_OPERATOR']

                this.operatorMap[operatorId] = true
                if (!this.workcenterMap[workcenter.id]){
                  this.workcenterMap[workcenter.id] = workcenter
                }
                if (!this.workcenterMap[workcenter.id]['TMP_OPERATOR_SAMPLE_LIST']){
                  this.workcenterMap[workcenter.id]['TMP_OPERATOR_SAMPLE_LIST'] = {}
                }
                if (!this.workcenterMap[workcenter.id]['TMP_OPERATOR_SAMPLE_LIST'][operatorId]){
                  this.workcenterMap[workcenter.id]['TMP_OPERATOR_SAMPLE_LIST'][operatorId] = []
                }
                this.workcenterMap[workcenter.id]['TMP_OPERATOR_SAMPLE_LIST'][operatorId].push(sample)
                console.log("..", sample.SYS_WORKCENTER_OPERATOR)
                return true
              } else {
                return false
              }
            })
            this.workcenterList.push(workcenter)
          })
        })
      })
    })
  }
}
