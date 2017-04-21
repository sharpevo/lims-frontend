import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'

@Component({
  selector: 'workcenter-sample-activated',
  templateUrl: './sample.activated.component.html',
})
export class WorkcenterSampleActivatedComponent{
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
        return (d['SYS_DATE_SCHEDULED']) &&
          (d['SYS_DATE_ARRIVED']) &&
          (!d[operatorCode]) &&
          (!d['SYS_DATE_COMPLETED']) &&
          (!d['SYS_DATE_TERMINATED'])
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
