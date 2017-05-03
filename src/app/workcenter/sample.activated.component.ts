import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {SampleService} from '../models/sample'

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
    private sampleService: SampleService,
  ){}

  ngOnInit(){
    this.getSampleList()
  }

  getSampleList(){
    this.sampleList = []
    let operatorCode = 'SYS_WORKCENTER_OPERATOR'

    this.entityService.retrieveEntity(this.workcenter.id, 'collection')
    .subscribe(data => {

      let activatedSampleList = []
      data.forEach(d => {

        this.sampleService.getPreviousChainedSample(d, previousSample => {

          // clear samples without operator in current workcenter
          if (!d[operatorCode]) {

            // previous sample should have been completed in some form
            if (previousSample['SYS_DATE_COMPLETED'] ||
                previousSample['SYS_DATE_TERMINATED']){
              // push previous sample in the avalable list to get attributes
              previousSample['TMP_NEXT_SAMPLE_ID'] = d.id
              this.sampleList.push(previousSample)
            }
          }
        })

      })
    })
  }
}
