import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {SampleService} from '../models/sample'
//import {Observable} from 'rxjs/Observable'
import { Observable } from 'rxjs/Rx'

@Component({
  selector: 'workcenter-sample-activated',
  templateUrl: './sample.activated.component.html',
})
export class WorkcenterSampleActivatedComponent{
  @Input() sampleList
  @Input() callback
  @Input() checkedEntityList
  @Input() workcenter
  sampleCount: number = 0

  activatedSampleList: any[] = []

  constructor(
    private entityService: EntityService,
    private sampleService: SampleService,
  ){}

  ngOnInit(){
    this.getSampleList()
  }

  getSampleList(){
    this.activatedSampleList = []
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
        if (!this.sampleList[i][operatorCode]) {

          // previous sample should have been completed in some form
          if ( !this.sampleList[i]['SYS_DATE_TERMINATED'] &&
              (previousSample['SYS_DATE_COMPLETED'] ||
               previousSample['SYS_DATE_TERMINATED'] ||
                 previousSample.id == this.sampleList[i].id)){
            // location indicator for sampleList
            previousSample['TMP_NEXT_SAMPLE_INDEX'] = i
            // push previous sample in the avalable list to get attributes
            //previousSample['TMP_NEXT_SAMPLE_ID'] = this.sampleList[i].id

            this.activatedSampleList.push(previousSample)
          }
        }
      }
      this.sampleCount = this.activatedSampleList.length

    })
  }
}
