import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'

@Component({
  selector: 'workcenter-sample-scheduled',
  templateUrl: './sample.scheduled.component.html',
})
export class WorkcenterSampleScheduledComponent{
  @Input() workcenter
  @Input() callback
  sampleList: any[] = []

  constructor(
    private entityService: EntityService,
  ){}

  ngAfterViewInit(){
    this.getSampleList()
  }

  getSampleList(){
    this.entityService.retrieveEntity(this.workcenter.id, 'collection')
    .subscribe(data => {
      this.sampleList = data
      .filter(d => {
        return (d['SYS_DATE_SCHEDULED']) &&
          (!d['SYS_DATE_ARRIVED']) &&
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
