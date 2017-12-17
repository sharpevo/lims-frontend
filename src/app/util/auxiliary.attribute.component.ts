import {Component, Input} from '@angular/core'
import {SampleService} from '../models/sample'
import {MdDialog, MdDialogRef} from '@angular/material'
import {ShowAuxiliaryAttributeDialog} from './auxiliary.attribute.dialog'

@Component({
  selector: 'show-auxiliary-attribute',
  templateUrl: './auxiliary.attribute.component.html',
})
export class AuxiliaryAttributeComponent{
  @Input('outputValue') outputValue: any
  @Input('hybridObject') hybridObject: any
  @Input('sample') sample: any
  @Input('attributeLabel') attributeLabel: string
  @Input('attributeType') attributeType: string
  @Input('attributeGenre') attributeGenre: string
  @Input('attributeCode') attributeCode: string
  attributeObjectList: any = []

  constructor(
    public dialog: MdDialog,
    private sampleService: SampleService
  ){}

  ngOnInit(){
    this.sampleService.getAuxiliaryAttributeList(this.sample, this.attributeCode, this.attributeGenre, attributeObjectList => {
      this.attributeObjectList = attributeObjectList


      // Pass the latest value of the given attribute to the top of the
      // component structure, e.g. workcenter/sample.dispatched.component
      if (this.attributeObjectList.length > 0){
        let key = this.sample['SYS_SAMPLE_CODE']
        if (!this.hybridObject) {
          this.hybridObject = {}
        }
        if (!this.hybridObject[key]) {
          this.hybridObject[key] = {}
        }
        this.hybridObject[key][this.attributeCode] = {
          'value': attributeObjectList[0]['value'],
          'SYS_LABEL': this.attributeLabel,
          'SYS_CODE': this.attributeCode,
          'SYS_TYPE': this.attributeType,
        }
        if (!this.outputValue){
          this.outputValue = {}
        }
        if (!this.outputValue[this.sample.id]){
          this.outputValue[this.sample.id] = {}
        }
        this.outputValue[this.sample.id][this.attributeCode] = attributeObjectList[0]['value']
        console.log("OV", this.outputValue)
      }

    })
  }

  openAttributeHistoryDialog(){
    let dialogRef = this.dialog.open(ShowAuxiliaryAttributeDialog, {height: '400px', width: '300px'});
    dialogRef.componentInstance.config.attributeList = this.attributeObjectList
    dialogRef.afterClosed().subscribe(result => {
      // pass
    })
  }
}
