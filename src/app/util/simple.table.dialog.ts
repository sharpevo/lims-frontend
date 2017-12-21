import {Component} from '@angular/core'
import {MdDialog, MdDialogRef} from '@angular/material';
import {MdSnackBar} from '@angular/material'
import {GenreService} from '../genre/service'
import {AttributeService} from '../attribute/service'

@Component({
  selector: 'simple-table-dialog',
  templateUrl: './simple.table.dialog.html',
})
export class SimpleTableDialog {

  config: any = {}
  targetHybridType: string = ''
  attributeList: any[] = []
  constructor(
    private genreService: GenreService,
    private attributeService: AttributeService,
    private snackBar: MdSnackBar,
    public dialogRef: MdDialogRef<SimpleTableDialog>
  ){}

  ngOnInit(){
    console.log(this.config)
    switch (this.config.hybridType){
      case "RUN":
        this.targetHybridType = "LANE"
      this.getAttributeByIdentifier("/PRODUCT_WORKCENTER/POOLING/")
      break
      case "LANE":
        this.targetHybridType = "CAPTURE"
      this.getAttributeByIdentifier("/PRODUCT_WORKCENTER/CAPTURE_PREPARE/")
      break
      case "CAPTURE":
        this.targetHybridType = "SAMPLE"
      this.getAttributeByIdentifier("/PROJECT_MANAGEMENT/GENERAL_PROJECT/")
      break
      default:
        console.error("Invalid hybrid type")
    }
  }

  getAttributeByIdentifier(identifier:string){
    this.genreService.retrieveBy({
      "SYS_IDENTIFIER":identifier,
    })
    .subscribe(data => {
      this.attributeService.retrieveBy({
        "SYS_GENRE": data[0].id
      })
      .subscribe(data => {
        this.attributeList = data
      })
    })

  }
  showMessage(msg: string) {
    this.snackBar.open(msg, 'UNDO', {duration: 3000});
  }
}

