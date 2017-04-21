import {Component, ViewChild} from '@angular/core'
import {ActivatedRoute, Router} from '@angular/router'
import {EntityService} from '../entity/service'

@Component({
  selector: 'workcenter-dashboard',
  templateUrl: './dashboard.component.html',
})
export class WorkcenterDashboardComponent{
  sub: any = {}
  objectId: string = ''
  workcenter: any = {}
  workcenterId: string = ''
  checkedEntityList: any[] = []
  checkedDispatchedEntityList: any[] = []
  operatorList: any[] = []
  operator: string = ''
  operatorCode: string
  @ViewChild('dispatchedComponent') dispatchedComponent
  @ViewChild('activatedComponent') activatedComponent

  constructor(
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
      this.operatorCode = this.workcenter['SYS_CODE'] + "ATTR_OPERATOR"

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

}
