import {Component} from '@angular/core'
import {MdDialog, MdDialogRef} from '@angular/material';
import {MdSnackBar} from '@angular/material'

@Component({
  selector: 'simple-table-dialog',
  templateUrl: './simple.table.dialog.html',
})
export class SimpleTableDialog {

  config: any = {}
  constructor(
    private snackBar: MdSnackBar,
    public dialogRef: MdDialogRef<SimpleTableDialog>
  ){}

  ngOnInit(){
    console.log(this.config)
  }

  showMessage(msg: string) {
    this.snackBar.open(msg, 'UNDO', {duration: 3000});
  }
}

