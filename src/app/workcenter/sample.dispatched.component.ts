import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {SampleService} from '../models/sample'
import {Observable} from 'rxjs/Observable'

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
    let chainedSampleObs = []

    this.entityService.retrieveEntity(this.workcenter.id, 'collection')
    .subscribe(data => {

      data.forEach(d => {
        chainedSampleObs.push(
          this.entityService.retrieveBy({
            'SYS_TARGET': d['SYS_TARGET'],
            'sort': 'SYS_ORDER'})
        )
      })

      Observable
      .forkJoin(chainedSampleObs)
      .subscribe((chainedSamples: any[][]) => {
        for (let i=0; i<chainedSamples.length; i++){
          let previousSample = this.sampleService.parsePreviousSample(data[i], chainedSamples[i])

          if (previousSample.id == data[i].id){
            if (data[i][operatorCode] &&
                !data[i]['SYS_DATE_COMPLETED']) {
              data[i]['TMP_NEXT_SAMPLE_ID'] = data[i].id
            this.sampleList.push(data[i])
            }
          } else {
            if (data[i][operatorCode] &&
                !data[i]['SYS_DATE_COMPLETED']) {
              previousSample['TMP_NEXT_SAMPLE_ID'] = data[i].id
            this.sampleList.push(previousSample)
            }
          }
        }
      })
    })
  }
}
