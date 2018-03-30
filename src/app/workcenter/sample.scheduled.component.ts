import {Component, Input, Output} from '@angular/core'
import {EntityService} from '../entity/service'
import {SampleService} from '../models/sample'

import {Observable} from 'rxjs/Observable'

@Component({
  selector: 'workcenter-sample-scheduled',
  templateUrl: './sample.scheduled.component.html',
})
export class WorkcenterSampleScheduledComponent{
  @Input() sampleList
  @Input() callback
  @Input() checkedEntityList
  scheduledSampleList: any[] = []
  sampleCount: number = 0

  constructor(
    private entityService: EntityService,
    private sampleService: SampleService,
  ){}

  ngOnInit(){
    this.getSampleList()
  }

  getSampleList(){
    if (!this.sampleList){
      return
    }

    let operatorCode = 'SYS_WORKCENTER_OPERATOR'
    let chainedSampleObs = []

    this.sampleList.forEach(d => {
      chainedSampleObs.push(
        this.entityService.retrieveBy({
          'SYS_TARGET': d['SYS_TARGET'],
          'sort': 'SYS_ORDER'})
      )
    })

    Observable
    .forkJoin(chainedSampleObs)
    .subscribe((data: any[][]) => {
      for (let i=0; i<data.length; i++){
        let previousSample = this.sampleService.parsePreviousSample(this.sampleList[i], data[i])
        if (previousSample['SYS_DATE_SCHEDULED'] &&
            !previousSample['SYS_DATE_COMPLETED'] &&
              !previousSample['SYS_DATE_TERMINATED'] &&
                !this.sampleList[i]['SYS_DATE_TERMINATED'] &&
                  !this.sampleList[i][operatorCode]) {
          this.scheduledSampleList.push(this.sampleList[i])
        }
      }
      this.sampleCount = this.scheduledSampleList.length
    })
  }

}
