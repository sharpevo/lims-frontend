import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'

@Component({
  selector: 'workcenter-sample-terminated',
  templateUrl: './sample.terminated.component.html',
})
export class WorkcenterSampleTerminatedComponent{
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
        return (d['SYS_DATE_TERMINATED'])
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
