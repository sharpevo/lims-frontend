import {Component, ViewChild} from '@angular/core'
import {ActivatedRoute, Router} from '@angular/router'
import {MdDialog, MdDialogRef} from '@angular/material'
import {EntityService} from '../entity/service'
import {SampleFormDialog} from './form.dialog.component'

import {Observable} from 'rxjs/Observable'

@Component({
  selector: 'workcenter-dashboard',
  templateUrl: './dashboard.component.html',
})
export class WorkcenterDashboardComponent{
  sub: any = {}
  selectedOption: string
  objectId: string = ''
  workcenter: any = {}
  workcenterId: string = ''
  checkedEntityList: any[] = []
  checkedDispatchedEntityList: any[] = []
  operatorList: any[] = []
  operator: string = ''
  operatorCode: string = 'SYS_WORKCENTER_OPERATOR'
  @ViewChild('dispatchedComponent') dispatchedComponent
  @ViewChild('activatedComponent') activatedComponent
  @ViewChild('completedComponent') completedComponent

  constructor(
    public dialog: MdDialog,
    private route: ActivatedRoute,
    private router: Router,
    private entityService: EntityService,
  ){
    this.objectId = this.route.snapshot.params['id']
  }

  ngOnInit(){
    this.sub = this.route.params.subscribe(params => {
      this.workcenterId = params['id']
      this.getWorkcenter()
      this.getOperatorList()
    })
  }

  getWorkcenter(){
    this.entityService.retrieveById(this.workcenterId)
    .subscribe(data => {
      this.workcenter = data

    })
  }

  getOperatorList(){
    this.entityService.retrieveByIdentifierAndCategory(
      '/HUMAN_RESOURCE/IGENETECH',
      'collection')
      .subscribe(data => {
        this.operatorList = data
      })
  }

  dispatch(){
    let retrieveObs = []
    let updateObs = []
    if (this.operator) {
      this.checkedEntityList.forEach(previousSample => {
        retrieveObs.push(this.entityService.retrieveById(previousSample['TMP_NEXT_SAMPLE_ID']))
      })

      Observable
      .forkJoin(retrieveObs)
      .subscribe(data => {
        data.forEach(d => {
          d[this.operatorCode] = this.operator
          updateObs.push(this.entityService.update(d))
        })

        console.log("**", updateObs)
        Observable
        .forkJoin(updateObs)
        .subscribe(data => {
          this.dispatchedComponent.getSampleList()
          this.activatedComponent.getSampleList()
          this.checkedEntityList = []
        })
      })
    }
    //this.checkedEntityList = []
  }

  undispatch(){
    let retrieveObs = []
    let updateObs = []
    this.checkedDispatchedEntityList.forEach(previousSample => {
      retrieveObs.push(this.entityService.retrieveById(previousSample['TMP_NEXT_SAMPLE_ID']))
    })

    Observable
    .forkJoin(retrieveObs)
    .subscribe(data => {
      data.forEach(d => {
        d[this.operatorCode] = ""
        updateObs.push(this.entityService.update(d))
      })

      Observable
      .forkJoin(updateObs)
      .subscribe(data => {
        this.dispatchedComponent.getSampleList()
        this.activatedComponent.getSampleList()
        this.checkedDispatchedEntityList = []
      })
    })
  }

  undispatch2(){
    this.checkedDispatchedEntityList.forEach(previousSample => {
      this.entityService.retrieveById(previousSample['TMP_NEXT_SAMPLE_ID'])
      .subscribe(entity => {
        entity[this.operatorCode] = ""
        this.entityService.update(entity)
        .subscribe(data => {
          this.activatedComponent.getSampleList()
          this.dispatchedComponent.getSampleList()
        })
      })
    })
    this.checkedDispatchedEntityList = []
  }

  openNewEntityDialog(entity: any) {
    let dialogRef = this.dialog.open(SampleFormDialog, {width: '600px'});
    dialogRef.componentInstance.config.entity = entity
    dialogRef.componentInstance.config.sampleList = this.checkedDispatchedEntityList
    dialogRef.afterClosed().subscribe(result => {
      this.dispatchedComponent.getSampleList()
      this.completedComponent.getSampleList()
      this.checkedEntityList = []
      this.checkedDispatchedEntityList = []
    });
  }
}
