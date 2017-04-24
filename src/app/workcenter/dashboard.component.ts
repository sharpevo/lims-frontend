import {Component, ViewChild} from '@angular/core'
import {ActivatedRoute, Router} from '@angular/router'
import {MdDialog, MdDialogRef} from '@angular/material'
import {EntityService} from '../entity/service'
import {SampleFormDialog} from './form.dialog.component'

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
    if (this.operator) {
      this.checkedEntityList.forEach(entityId => {
        this.entityService.retrieveById(entityId)
        .subscribe(entity => {
          entity[this.operatorCode] = this.operator
          this.entityService.update(entity)
          .subscribe(data => {
            this.dispatchedComponent.getSampleList()
            this.activatedComponent.getSampleList()
          })
        })
      })
    } else {
      console.log("invalid operator")
    }
  }

  undispatch(){
    this.checkedDispatchedEntityList.forEach(entityId => {
      this.entityService.retrieveById(entityId)
      .subscribe(entity => {
        entity[this.operatorCode] = ""
        this.entityService.update(entity)
        .subscribe(data => {
          this.activatedComponent.getSampleList()
          this.dispatchedComponent.getSampleList()
        })
      })
    })
  }

  openNewEntityDialog(entity: any) {
    let dialogRef = this.dialog.open(SampleFormDialog, {width: '600px'});
    dialogRef.componentInstance.config.entity = entity
    dialogRef.componentInstance.config.sampleList = this.checkedDispatchedEntityList
    dialogRef.afterClosed().subscribe(result => {
      this.selectedOption = result;
    });
  }
}
