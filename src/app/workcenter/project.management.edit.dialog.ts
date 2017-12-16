import {Component} from '@angular/core'
import {MdDialog, MdDialogRef} from '@angular/material';
import {MdSnackBar} from '@angular/material'

import {EntityService} from '../entity/service'
import {GenreService} from '../genre/service'
import {Router} from '@angular/router'

@Component({
  selector: 'edit-pm-sample-dialog',
  templateUrl: './project.management.edit.dialog.html',
})
export class EditPMSampleDialog {
  config: any = {}
  attributeList: any[] = []
  object: any = {}
  disabledAttribute: any = {
    "SYS_SAMPLE_CODE": true,
    "SYS_DATE_SCHEDULED": true,
  }
  constructor(
    private snackBar: MdSnackBar,
    private entityService: EntityService,
    private genreService: GenreService,
    private router: Router,
    public dialogRef: MdDialogRef<EditPMSampleDialog>) {}

    ngOnInit(){
      this.getAttributeList()
      this.object = Object.assign({}, this.config.sampleEdited)
    }

    getAttributeList(){
      this.entityService.retrieveGenre(this.config.entity.id)
      .subscribe(data => {
        this.genreService.retrieveAttribute(data[0].id)
        //this.entityService.retrieveAttribute(this.config.entity.id)
        .subscribe(data => {
          console.log("EDIT>>>entity", this.config.entity)
          console.log("EDIT>>>genre", data[0])
          console.log("EDIT>>>attribute", data)
          this.attributeList = data
        })

      })
    }

    updateObject(){
      this.entityService.update(this.object)
      .subscribe(data => {
        this.object = {}
        console.log('Update Entity:', data)
        this.showMessage("Updated")
        this.router.navigate(['/redirect' + this.router.url])
      })
    }

    showMessage(msg: string) {
      this.snackBar.open(msg, 'UNDO', {duration: 3000});
    }

}


