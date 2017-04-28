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

  allContracts = [
    {
      "id": 1,
      "client": 1,
      "name": "20170582K",
      "batch": ["01K", "15R", "75A"],
    },
    {
      "id": 2,
      "client": 1,
      "name": "2015THOEC",
      "batch": ["26B", "83T", "12O"],
    },
    {
      "id": 3,
      "client": 2,
      "name": "2016TERA6",
      "batch": ["42J", "27L", "45Z"],
    },
    {
      "id": 4,
      "client": 2,
      "name": "20160912P",
      "batch": ["86C", "43T", "33D"],
    },
    {
      "id": 5,
      "client": 3,
      "name": "201706921A",
      "batch": ["91E", "76W", "32G"],
    },
    {
      "id": 6,
      "client": 3,
      "name": "20160293T",
      "batch": ["60Q", "49M", "52V"],
    },
  ]

  constructor(
    public dialog: MdDialog,
    private entityService: EntityService,
  ){}

  ngOnInit(){
    this.getClientList()
    this.entity = this.entityService.retrieveByIdentifierFull(
      "/PROJECT_MANAGEMENT/GENERAL_PROJECT")
      .subscribe(data => {
        this.entity = data[0]
      })
  }

  getClientList(){
    this.clientList = [
      {
        "id": 1,
        "name": "HVS",
      },
      {
        "id": 2,
        "name": "NTC",
      },
      {
        "id": 3,
        "name": "OWF",
      }
    ]
  }

  getContractListByClient(client: any){
    this.allContracts.forEach(contract => {
      if (contract.client == client.id) {
        this.contractList.push(contract) 
      }
    })
  }

  getBatchListByContract(contract: any){
    this.batchList = contract.batch
  }

  getSampleListByBatch(batch: any){
    this.sampleList = [
      {
        "SYS_SAMPLE_CODE": "17R0201",
        "SAMPLE_NAME": "样品一",
      },
      {
        "SYS_SAMPLE_CODE": "17R0202",
        "SAMPLE_NAME": "样品二",
      },
      {
        "SYS_SAMPLE_CODE": "17R0203",
        "SAMPLE_NAME": "样品三",
      },
      {
        "SYS_SAMPLE_CODE": "17R0204",
        "SAMPLE_NAME": "样品四",
      },
      {
        "SYS_SAMPLE_CODE": "17R0205",
        "SAMPLE_NAME": "样品五",
      },
    ]
  }

  openNewEntityDialog(entity: any) {
    let dialogRef = this.dialog.open(SampleFormDialog, {width: '600px'});
    dialogRef.componentInstance.config.entity = entity
    dialogRef.componentInstance.config.issueSample = true
    dialogRef.componentInstance.config.sampleList = this.sampleList.filter(sample => sample.TMP_CHECK)
    dialogRef.afterClosed().subscribe(result => {
    });
  }
}
