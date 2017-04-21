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
    let operatorCode = this.workcenter['SYS_CODE'] + "_ATTR_OPERATOR"
    this.entityService.retrieveEntity(this.workcenter.id, 'collection')
    .subscribe(data => {
      this.sampleList = data
      .filter(d => {
        return (d[operatorCode] && d[operatorCode] != '')
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

}
