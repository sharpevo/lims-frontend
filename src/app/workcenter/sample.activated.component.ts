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
    let operatorCode = 'SYS_WORKCENTER_OPERATOR'
    this.entityService.retrieveEntity(this.workcenter.id, 'collection')
    .subscribe(data => {

      let activatedSampleList = []
      data.forEach(d => {
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
              if (!d[operatorCode]){
                activatedSampleList.push(d)
              }
            }

          } else {
            console.log("samples no in the chain.")
          }

          // clear samples without operator in current workcenter
          if (!d[operatorCode]) {

            // previous sample should have been completed in some form
            if (previousSample['SYS_DATE_COMPLETED'] ||
                previousSample['SYS_DATE_TERMINATED']){
              activatedSampleList.push(d)
            }
          }

        })
      })
      this.sampleList = activatedSampleList
    })
  }

}
