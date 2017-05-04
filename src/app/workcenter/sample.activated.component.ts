import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {SampleService} from '../models/sample'
import {Observable} from 'rxjs/Observable'

@Component({
  selector: 'workcenter-sample-activated',
  templateUrl: './sample.activated.component.html',
})
export class WorkcenterSampleActivatedComponent{
  @Input() workcenter
  @Input() callback
  @Input() checkedEntityList

  sampleList: any[] = []
  loaded: boolean = false

  constructor(
    private entityService: EntityService,
    private sampleService: SampleService,
  ){}

  ngOnInit(){
    this.getSampleList()
  }

  getSampleList(){
    this.sampleList = []
    let operatorCode = 'SYS_WORKCENTER_OPERATOR'
    let chainedSampleObs = []

    this.entityService.retrieveEntity(this.workcenter.id, 'collection')
    .subscribe(samples => {

      let activatedSampleList = []
      samples.forEach(d => {
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
          let previousSample = this.sampleService.parsePreviousSample(samples[i], data[i])
          if (!samples[i][operatorCode]) {

            // previous sample should have been completed in some form
            if (previousSample['SYS_DATE_COMPLETED'] ||
                previousSample['SYS_DATE_TERMINATED']){
              // push previous sample in the avalable list to get attributes
              previousSample['TMP_NEXT_SAMPLE_ID'] = samples[i].id
              this.sampleList.push(previousSample)
            }
          }
        }


      })

    })
  }
}
