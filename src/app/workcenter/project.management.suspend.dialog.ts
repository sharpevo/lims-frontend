import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
    selector: 'pm-suspend-dialog',
    templateUrl: './project.management.suspend.dialog.html',
})
export class SuspendSampleDialog {

    title: string = "SUSPEND"
    constructor(
        public dialogRef: MatDialogRef<SuspendSampleDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit(){
        if (!this.data.isSuspended) {
            this.title = "RESUME"
        }
    }

}
