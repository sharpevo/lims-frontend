import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'

@Component({
  selector: 'sample-history',
  templateUrl: './history.component.html',
})

export class SampleHistoryComponent {
  @Input() sample: any
  @Input() selectedSampleList: any[]
  sampleMap: any = {}
  constructor(
    private entityService: EntityService
  ){}

  ngOnInit(){
    this.getSampleMap()
  }

  getSampleMap() {

    this.entityService.retrieveBySortBy(
      {'SYS_SAMPLE_CODE': this.sample['SYS_SAMPLE_CODE']},
      "createdAt")
      .subscribe(data => {

        data.forEach(sample => {

          // only minions without the master
          if (sample['SYS_TARGET']){

            if (!this.sampleMap[sample['SYS_TARGET']]) {
              this.sampleMap[sample['SYS_TARGET']] = []
              console.log("---")
            }
            this.sampleMap[sample['SYS_TARGET']].push(sample)
          }
        })

      })

  }

  // what a pity solution
  getSampleKeys(){
    return Object.keys(this.sampleMap)
  }

}
