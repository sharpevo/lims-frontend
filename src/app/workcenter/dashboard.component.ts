import {Component} from '@angular/core'
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
    })
  }

  getWorkcenter(){
    this.entityService.retrieveById(this.workcenterId)
    .subscribe(data => {
      this.workcenter = data
    })
  }

}
