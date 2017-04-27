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

  getSampleListCurrent(){
    let operatorCode = 'SYS_WORKCENTER_OPERATOR'
    this.entityService.retrieveEntity(this.workcenter.id, 'collection')
    .subscribe(data => {
      this.sampleList = data
      .filter(d => {
        return (d[operatorCode] &&
                d[operatorCode] != '' &&
                !d['SYS_DATE_COMPLETED'])
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

  getSampleList(){
    this.sampleList = []
    let operatorCode = 'SYS_WORKCENTER_OPERATOR'
    this.entityService.retrieveEntity(this.workcenter.id, 'collection')
    .subscribe(data => {

      //let dispatchedSampleList = []
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
              // clear samples without operator in current workcenter
              if (d[operatorCode] &&
                  !d['SYS_DATE_COMPLETED']) {
                previousSample['TMP_NEXT_SAMPLE_ID'] = d.id
              this.sampleList.push(previousSample)
              }

            } else {
              // d is the first sample in the chain and should be removed out
              // of the scheduled list and moved into the activated list
              previousSample = {}
              if (d[operatorCode] &&
                  !d['SYS_DATE_COMPLETED']) {
                d['TMP_NEXT_SAMPLE_ID'] = d.id
              this.sampleList.push(d)
              }
            }

          } else {
            console.log("samples no in the chain.")
          }

        })
      })
      //this.sampleList = dispatchedSampleList
    })
  }

}
