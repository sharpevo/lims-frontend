import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {MdDialog, MdDialogRef} from '@angular/material'
import {SampleFormDialog} from './form.dialog.component'
import {MdSnackBar} from '@angular/material'
import {EditPMSampleDialog} from './project.management.edit.dialog'

@Component({
  selector: 'project-management',
  styles: [`
    .disabled-panel{
    opacity: 0.3;
    pointer-events: none;
    }
    .query-input{
    margin-top: -14px;
    }
    `
  ],
  templateUrl: './project.management.component.html',
})
export class ProjectManagementComponent{

  entity: any = {}

  clientList: any[] = []
  selectedClient: any = {}
  contractList: any[] = []
  batchList: any[] = []
  sampleList: any[] = []
  showHistory: any = {}
  skip = 0
  queryCode: string = ''
  queryValue: string = ''

  constructor(
    public dialog: MdDialog,
    private entityService: EntityService,
    private snackBar: MdSnackBar,
  ){}

  ngOnInit(){
    this.entityService.retrieveByIdentifierFull(
      "/PROJECT_MANAGEMENT/GENERAL_PROJECT")
      .subscribe(data => {
        this.entity = data[0]
        this.getSampleList()
      })
  }

  getSampleList(){
    let option = "&limit=10&sort=-createdAt&skip=" + this.skip
    if (this.queryCode != '' && this.queryValue != '') {
      option += `&where={"${this.queryCode}":{"regex":".*${this.queryValue}.*"}}`
    }
    this.entityService.retrieveEntity(
      this.entity.id,
      "collection",
      option
    )
    .subscribe(data => {
      this.sampleList = data
      .filter(sample => {
        // may be date or status
        return true
      })

      this.sampleList.forEach(sample => {
        // excel plugin only export checked sample
        sample.TMP_CHECKED = true
      })
    })
  }

  nextPage(){
    this.skip += 10
    this.getSampleList()
  }

  prevPage(){
    this.skip -= 10
    if (this.skip <= 0) {
      this.skip = 0
    }
    this.getSampleList()
  }

  showMessage(msg: string) {
    this.snackBar.open(msg, 'OK', {duration: 3000});
  }


  openNewEntityDialog(entity: any) {
    let dialogRef = this.dialog.open(SampleFormDialog, {height:'70%', width: '70%'});
    dialogRef.componentInstance.config.entity = entity
    dialogRef.componentInstance.config.issueSample = true
    //dialogRef.componentInstance.config.sampleList = this.sampleList.filter(sample => sample.TMP_CHECK)
    dialogRef.componentInstance.config.sampleList = [{}]
    dialogRef.afterClosed().subscribe(result => {
      //this.sampleList = this.sampleList.filter(sample => !sample.TMP_CHECK)
      this.getSampleList()
    });
  }

  openEditEntityDialog(sample: any) {
    let dialogRef = this.dialog.open(EditPMSampleDialog, {height:'70%', width: '70%'});
    dialogRef.componentInstance.config.entity = this.entity
    dialogRef.componentInstance.config.sampleEdited = sample
    dialogRef.afterClosed().subscribe(result => {
      //this.sampleList = this.sampleList.filter(sample => !sample.TMP_CHECK)
      this.getSampleList()
    });
  }

  clearQuery(){
    this.queryCode = ''
    this.queryValue = ''
    this.getSampleList()
  }
}
