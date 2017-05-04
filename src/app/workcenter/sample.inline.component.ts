import {Component, Input} from '@angular/core'
import {SampleService} from '../models/sample'

import {EntityService} from '../entity/service'
import {AttributeService} from '../attribute/service'

@Component({
  selector: 'sample-info-inline',
  templateUrl: './sample.inline.component.html',
})
export class SampleInfoInlineComponent{
  @Input() sampleList
  @Input() showCheckbox
  result: any

  constructor(
    private entityService: EntityService,
    private attributeService: AttributeService,
    private sampleService: SampleService,
  ){}

  ngOnInit(){
    this.result = this.sampleService.buildSampleInlineList(this.sampleList)
  }

  checkEntity(key: string){
    this.result[key].forEach(sample => {
      sample['TMP_CHECKED'] = !this.result[key]['TMP_CHECKED']
    })
  }
}
