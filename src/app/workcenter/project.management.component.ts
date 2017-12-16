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
  showHistory: any = {}
  skip = 0

  constructor(
    public dialog: MdDialog,
    private entityService: EntityService,
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
    this.entityService.retrieveEntity(
      this.entity.id,
      "collection",
      "&limit=10&skip=" + this.skip
    )
    .subscribe(data => {
      this.sampleList = data
      .filter(sample => {
        // may be date or status
        return true
      })
      .sort(
        (a,b) => {
          if (a.updatedAt < b.updatedAt) {
            return 1
          } else {
            return -1
          }
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

}
