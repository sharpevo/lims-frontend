import {Component, Input} from '@angular/core'
import {SampleService} from '../models/sample'

import {EntityService} from '../entity/service'
import {AttributeService} from '../attribute/service'

@Component({
  selector: 'sample-info-inline',
  templateUrl: './sample.inline.component.html',
})
export class SampleInfoInlineComponent{
  @Input() shownSampleList
  @Input() sampleList
  @Input() showCheckbox
  result: any

  constructor(
    private entityService: EntityService,
    private attributeService: AttributeService,
    private sampleService: SampleService,
  ){}

  ngOnInit(){
    if (!this.shownSampleList) {
      this.shownSampleList = this.sampleList
    }
    this.result = this.sampleService.buildSampleInlineList(this.shownSampleList)
  }

  checkEntity(key: string){
    this.result[key].forEach(sample => {
      if (sample['TMP_NEXT_SAMPLE_INDEX'] >= 0){
        this.sampleList[sample['TMP_NEXT_SAMPLE_INDEX']]['TMP_CHECKED'] = !this.result[key]['TMP_CHECKED']
      } else {
        sample['TMP_CHECKED'] = !this.result[key]['TMP_CHECKED']
      }
    })
  }
}
