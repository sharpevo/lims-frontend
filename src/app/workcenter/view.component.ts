import {Component, Input} from '@angular/core'
import {MdDialog, MdDialogRef} from '@angular/material'
import {GenreFormDialog} from '../genre/form.dialog.component'
import {EntityFormDialog} from '../entity/form.dialog.component'
import {AttributeFormDialog} from '../attribute/form.dialog.component'

import {EntityService} from '../entity/service'

@Component({
  selector: 'workcenter-view',
  templateUrl: './view.component.html',
})

export class WorkcenterViewComponent {
  @Input() workcenter: any
  samplePendingList: any[] = []
  sampleProcessingList: any[] = []
  sampleCompletedList: any[] = []
  sampleExceptionalList: any[] = []

  constructor(
    public dialog: MdDialog,
    private entityService: EntityService
  ){}

  ngOnInit(){
    this.getSampleList()
  }

  getSampleList(){
    this.entityService.retrieveByIdentifierAndCategory(
      this.workcenter.SYS_IDENTIFIER,
      'collection')
      .subscribe(data => {
        console.log(data)
        data.forEach(sample => {
          let sampleDate = sample['SYS_DATE_ARRIVED']
          if (sample['SYS_OPERATOR']) {
            if (sample['SYS_DATE_COMPLETED']){
              this.sampleCompletedList.push(sample)
            }else{
              this.sampleProcessingList.push(sample)
            }
          } else {
            if (sampleDate){
              if (sample['SYS_DATE_COMPLETED']){
                this.sampleExceptionalList.push(sample)
              } else {
                this.samplePendingList.push(sample)
              }
            } 
          }
        })
      })
  }


}
