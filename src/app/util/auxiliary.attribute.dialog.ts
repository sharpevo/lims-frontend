import {Component} from '@angular/core'
import {MatDialog, MatDialogRef} from '@angular/material';

@Component({
  selector: 'show-auxiliary-attribute-dialog',
  templateUrl: './auxiliary.attribute.dialog.html',
})
export class ShowAuxiliaryAttributeDialog {

  config: any = {}
  constructor(
    public dialogRef: MatDialogRef<ShowAuxiliaryAttributeDialog>
  ){}

  ngOnInit(){
  }
}

