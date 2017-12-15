import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {MdDialog, MdDialogRef} from '@angular/material'
import {SampleFormDialog} from './form.dialog.component'

@Component({
  selector: 'project-management',
  templateUrl: './project.management.component.html',
})
export class ProjectManagementComponent{

  entity: any = {}

  clientList: any[] = []
  selectedClient: any = {}
  contractList: any[] = []
  batchList: any[] = []
  sampleList: any[] = []

  constructor(
    public dialog: MdDialog,
    private entityService: EntityService,
  ){}

  ngOnInit(){
    this.entity = this.entityService.retrieveByIdentifierFull(
      "/PROJECT_MANAGEMENT/GENERAL_PROJECT")
      .subscribe(data => {
        this.entity = data[0]
        this.getSampleList()
      })
  }

  getSampleList(){
    this.entityService.retrieveEntity(this.entity.id, "collection", "&limit=10")
    .subscribe(data => {
      this.sampleList = data.sort(
        (a,b) => {
          if (a.updatedAt < b.updatedAt) {
            return 1
          } else {
            return -1
          }
        })
    })
  }

  openNewEntityDialog(entity: any) {
    let dialogRef = this.dialog.open(SampleFormDialog, {height:'850px', width: '600px'});
    dialogRef.componentInstance.config.entity = entity
    dialogRef.componentInstance.config.issueSample = true
    //dialogRef.componentInstance.config.sampleList = this.sampleList.filter(sample => sample.TMP_CHECK)
    dialogRef.componentInstance.config.sampleList = [{}]
    dialogRef.afterClosed().subscribe(result => {
      //this.sampleList = this.sampleList.filter(sample => !sample.TMP_CHECK)
      this.getSampleList()
    });
  }

  clearForm(){
    console.log("clear form")
  }
}
