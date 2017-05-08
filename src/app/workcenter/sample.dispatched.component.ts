import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {SampleService} from '../models/sample'
import {Observable} from 'rxjs/Observable'

@Component({
  selector: 'workcenter-sample-dispatched',
  templateUrl: './sample.dispatched.component.html',
})
export class WorkcenterSampleDispatchedComponent{
  @Input() sampleList
  @Input() callback
  @Input() checkedEntityList

  dispatchedSampleList: any[] = []

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

        console.log(previousSample)
        if (previousSample.id == this.sampleList[i].id){
          if (data[i][operatorCode] &&
              !data[i]['SYS_DATE_COMPLETED']) {
            data[i]['TMP_NEXT_SAMPLE_ID'] = this.sampleList[i].id
          data['TMP_NEXT_SAMPLE_INDEX'] = i
          this.dispatchedSampleList.push(data[i])
          }
        } else {
          if (data[i][operatorCode] &&
              !data[i]['SYS_DATE_COMPLETED']) {
            previousSample['TMP_NEXT_SAMPLE_ID'] = this.sampleList[i].id
          previousSample['TMP_NEXT_SAMPLE_INDEX'] = i
          this.dispatchedSampleList.push(previousSample)
          }
        }
      }
    })
  }
}
