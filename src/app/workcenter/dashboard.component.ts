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

  sampleList: any[] = []

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
      this.getSampleList()
    })
  }

  getSampleList(){
    this.entityService.retrieveEntity(this.workcenterId, 'collection')
    .subscribe(data => {
      this.sampleList = data
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
    if (!this.operator) {
      return
    }

    this.sampleList.forEach(previousSample => {
      if (previousSample['TMP_CHECKED']){
        //retrieveObs.push(this.entityService.retrieveById(previousSample['TMP_NEXT_SAMPLE_ID']))
        retrieveObs.push(this.entityService.retrieveById(previousSample.id))
      }
    })

    Observable
    .forkJoin(retrieveObs)
    .subscribe(data => {
      data.forEach(d => {
        d[this.operatorCode] = this.operator
        updateObs.push(this.entityService.update(d))
      })

      Observable
      .forkJoin(updateObs)
      .subscribe(data => {
        // Update child component after updating sample list
        // it works better than asynchronous func like getSampleList()
        // same as undispatch()
        this.entityService.retrieveEntity(this.workcenterId, 'collection')
        .subscribe(data => {
          this.sampleList = data
          this.dispatchedComponent.getSampleList()
          this.activatedComponent.getSampleList()
        })
      })
    })

  }

  undispatch(){
    let retrieveObs = []
    let updateObs = []

    this.sampleList.forEach(previousSample => {
      if (previousSample['TMP_CHECKED']){
        //retrieveObs.push(this.entityService.retrieveById(previousSample['TMP_NEXT_SAMPLE_ID']))
        retrieveObs.push(this.entityService.retrieveById(previousSample.id))
      }
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
        this.entityService.retrieveEntity(this.workcenterId, 'collection')
        .subscribe(data => {
          this.sampleList = data
          this.dispatchedComponent.getSampleList()
          this.activatedComponent.getSampleList()
        })
      })
    })
  }

  openNewEntityDialog(entity: any) {
    let dialogRef = this.dialog.open(SampleFormDialog, {width: '600px'});
    dialogRef.componentInstance.config.entity = entity
    dialogRef.componentInstance.config.sampleList = this.sampleList.filter(sample => sample['TMP_CHECKED'])
    dialogRef.afterClosed().subscribe(result => {
      this.entityService.retrieveEntity(this.workcenterId, 'collection')
      .subscribe(data => {
        this.sampleList = data
        this.dispatchedComponent.getSampleList()
        this.completedComponent.getSampleList()
        this.checkedEntityList = []
        this.checkedDispatchedEntityList = []
      })
    });
  }
}
