import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'

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
  ){}

  ngOnInit(){
    this.getSampleList()
  }

  getSampleList(){
    if (!this.sampleList){
      return
    }

    this.sampleList.forEach(d => {
      // retrieve chained samples by the same SYS_TARGET
      this.entityService.retrieveChainedSamples(d['SYS_TARGET'])
      .subscribe(samples => {

        // get previous sample
        let index = -1
        let previousSample = {}

        for (let i=0; i < samples.length; i ++){
          if (samples[i].id == d.id){
            index = i
            break
          }
        }

        if (index > -1){
          if (index > 0){
            previousSample = samples[index-1]
          } else {
            // d is the first sample in the chain and should be removed out
            // of the scheduled list and moved into the activated list
            previousSample = {}
          }

        } else {
          console.log("samples no in the chain.")
        }

        if (previousSample['SYS_DATE_SCHEDULED'] &&
            !previousSample['SYS_DATE_COMPLETED'] &&
              !previousSample['SYS_DATE_TERMINATED']) {
          this.scheduledSampleList.push(d)
        }

      })
    })
  }

}
