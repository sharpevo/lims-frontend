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
  @Input() workcenter

  dispatchedSampleList: any[] = []
  builtSampleList: any[] = []
  sampleCount: number = 0

  constructor(
    private entityService: EntityService,
    private sampleService: SampleService,
  ){}

  ngOnInit(){
    this.getSampleList()
  }

  getSampleList(){
    this.dispatchedSampleList = []
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
        let currentSample = this.sampleList[i]
        let previousSample = this.sampleService.parsePreviousSample(this.sampleList[i], data[i])

        if (currentSample[operatorCode] &&
            !currentSample['SYS_DATE_COMPLETED']) {
          if (previousSample.id == currentSample.id){
            currentSample['TMP_NEXT_SAMPLE_ID'] = currentSample.id
            currentSample['TMP_NEXT_SAMPLE_INDEX'] = i
            this.dispatchedSampleList.push(currentSample)
          } else {
            previousSample['TMP_NEXT_SAMPLE_ID'] = currentSample.id
            previousSample['TMP_NEXT_SAMPLE_INDEX'] = i
            this.dispatchedSampleList.push(previousSample)
          }
        }
      }

      this.sampleCount = this.dispatchedSampleList.length
      this.builtSampleList = this.sampleService.buildSampleInlineList(this.dispatchedSampleList)
    })

  }

}
