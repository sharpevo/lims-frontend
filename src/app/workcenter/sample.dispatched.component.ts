import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'

@Component({
  selector: 'workcenter-sample-dispatched',
  templateUrl: './sample.dispatched.component.html',
})
export class WorkcenterSampleDispatchedComponent{
  @Input() workcenter
  @Input() callback
  @Input() checkedEntityList

  sampleList: any[] = []

  constructor(
    private entityService: EntityService,
  ){}

  ngOnInit(){
    this.getSampleList()
  }

  getSampleList(){
    this.entityService.retrieveEntity(this.workcenter.id, 'collection')
    .subscribe(data => {
      this.sampleList = data
      .filter(d => {
        return (d['SYS_WORKCENTER_OPERATOR'])
      })
      .filter(d => {
        if (this.callback) {
          return this.callback(d)
        } else {
          return true
        }
      })
    })
  }

  undispatch(){
    this.checkedEntityList.forEach(entityId => {
      this.entityService.retrieveById(entityId)
      .subscribe(entity => {
        entity['SYS_WORKCENTER_OPERATOR'] = ""
        this.entityService.update(entity)
        .subscribe(data => {
          this.getSampleList()
        })
      })
    })
  }

}
