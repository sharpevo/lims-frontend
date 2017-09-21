import {Component, Input} from '@angular/core'
import {SampleService} from '../models/sample'
import {MdDialog, MdDialogRef} from '@angular/material'
import {ShowAuxiliaryAttributeDialog} from './auxiliary.attribute.dialog'

@Component({
  selector: 'show-auxiliary-attribute',
  templateUrl: './auxiliary.attribute.component.html',
})
export class AuxiliaryAttributeComponent{
  @Input('sample') sample: any
  @Input('attributeCode') attributeCode: string
  attributeObjectList: any = []

  constructor(
    public dialog: MdDialog,
    private sampleService: SampleService
  ){}

  ngOnInit(){
    this.sampleService.getAuxiliaryAttributeList(this.sample, this.attributeCode, attributeObjectList => {
      this.attributeObjectList = attributeObjectList
      console.log("---", this.attributeObjectList)
    })
  }

  openAttributeHistoryDialog(){
    let dialogRef = this.dialog.open(ShowAuxiliaryAttributeDialog, {height: '600px', width: '300px'});
    dialogRef.componentInstance.config.attributeList = this.attributeObjectList
    dialogRef.afterClosed().subscribe(result => {
      // pass
    })
  }



}
