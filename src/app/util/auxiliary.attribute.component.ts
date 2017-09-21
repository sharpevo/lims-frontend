import {Component, Input} from '@angular/core'
import {SampleService} from '../models/sample'

@Component({
  selector: 'show-auxiliary-attribute',
  templateUrl: './auxiliary.attribute.component.html',
})
export class AuxiliaryAttributeComponent{
  @Input('sample') sample: any
  @Input('attributeCode') attributeCode: string
  attributeObjectList: any = []

  constructor(
    private sampleService: SampleService
  ){}

  ngOnInit(){
    this.sampleService.getAuxiliaryAttributeList(this.sample, this.attributeCode, attributeObjectList => {
      this.attributeObjectList = attributeObjectList
      console.log("---", this.attributeObjectList)
    })
  }

  openAttributeHistoryDialog(){
    console.log(this.attributeObjectList)
  }


}
