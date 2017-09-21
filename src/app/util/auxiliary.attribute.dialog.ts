import {Component} from '@angular/core'
import {MdDialog, MdDialogRef} from '@angular/material';

@Component({
  selector: 'show-auxiliary-attribute-dialog',
  templateUrl: './auxiliary.attribute.dialog.html',
})
export class ShowAuxiliaryAttributeDialog {

  config: any = {}
  constructor(
    public dialogRef: MdDialogRef<ShowAuxiliaryAttributeDialog>
  ){}

  ngOnInit(){
  }
}

