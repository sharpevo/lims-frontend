import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {SampleService} from '../models/sample'

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
    private sampleService: SampleService,
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

      data.forEach(d => {
        this.sampleService.getPreviousChainedSample(d,previousSample => {

          if (previousSample.id == d.id){
            previousSample = {}
            if (d[operatorCode] &&
                !d['SYS_DATE_COMPLETED']) {
              d['TMP_NEXT_SAMPLE_ID'] = d.id
            this.sampleList.push(d)
            }
          } else {
            if (d[operatorCode] &&
                !d['SYS_DATE_COMPLETED']) {
              previousSample['TMP_NEXT_SAMPLE_ID'] = d.id
            this.sampleList.push(previousSample)
            }
          }
        })
      })
    })
  }
}
