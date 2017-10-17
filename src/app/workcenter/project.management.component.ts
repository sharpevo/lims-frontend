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
      this.getSampleListByBatch("")
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
        "SYS_INDEX_SEQUENCE":"AAACCC",
        "SYS_INDEX_CODE":"156",
        "SYS_PANEL_CODE":"T055",
        "SAMPLE_NAME": "样品一",
      },
      {
        "SYS_SAMPLE_CODE": "17R0202",
        "SYS_INDEX_SEQUENCE":"GGGTTT",
        "SYS_INDEX_CODE":"158",
        "SYS_PANEL_CODE":"T037",
        "SAMPLE_NAME": "样品二",
      },
      {
        "SYS_SAMPLE_CODE": "17R0203",
        "SYS_INDEX_SEQUENCE":"CCCGGG",
        "SYS_INDEX_CODE":"138",
        "SYS_PANEL_CODE":"T012",
        "SAMPLE_NAME": "样品三",
      },
      {
        "SYS_SAMPLE_CODE": "17R0204",
        "SYS_INDEX_SEQUENCE":"TTTAAA",
        "SYS_INDEX_CODE":"082",
        "SYS_PANEL_CODE":"T025",
        "SAMPLE_NAME": "样品四",
      },
      {
        "SYS_SAMPLE_CODE": "17R0205",
        "SYS_INDEX_SEQUENCE":"AAATTT",
        "SYS_INDEX_CODE":"017",
        "SYS_PANEL_CODE":"T023",
        "SAMPLE_NAME": "样品五",
      },
      {
        "SYS_SAMPLE_CODE": "17R0206",
        "SYS_INDEX_SEQUENCE":"TTTGGG",
        "SYS_INDEX_CODE":"025",
        "SYS_PANEL_CODE":"T011",
        "SAMPLE_NAME": "样品六",
      },
      {
        "SYS_SAMPLE_CODE": "17R0207",
        "SYS_INDEX_SEQUENCE":"GGGAAA",
        "SYS_INDEX_CODE":"115",
        "SYS_PANEL_CODE":"T033",
        "SAMPLE_NAME": "样品七",
      },
      {
        "SYS_SAMPLE_CODE": "17R0208",
        "SYS_INDEX_SEQUENCE":"CCCTTT",
        "SYS_INDEX_CODE":"102",
        "SYS_PANEL_CODE":"T051",
        "SAMPLE_NAME": "样品八",
      },
      {
        "SYS_SAMPLE_CODE": "17R0209",
        "SYS_INDEX_SEQUENCE":"AAACCC",
        "SYS_INDEX_CODE":"156",
        "SYS_PANEL_CODE":"T055",
        "SAMPLE_NAME": "样品九",
      },
      {
        "SYS_SAMPLE_CODE": "17R0210",
        "SYS_INDEX_SEQUENCE":"TTTGGG",
        "SYS_INDEX_CODE":"025",
        "SYS_PANEL_CODE":"T022",
        "SAMPLE_NAME": "样品十",
      },
      {
        "SYS_SAMPLE_CODE": "17R0211",
        "SYS_INDEX_SEQUENCE":"TTTCCC",
        "SYS_INDEX_CODE":"112",
        "SYS_PANEL_CODE":"T045",
        "SAMPLE_NAME": "样品十一",
      },
      {
        "SYS_SAMPLE_CODE": "17R0212",
        "SYS_INDEX_SEQUENCE":"GGGCCC",
        "SYS_INDEX_CODE":"127",
        "SYS_PANEL_CODE":"T031",
        "SAMPLE_NAME": "样品十二",
      },
    ]
  }

  openNewEntityDialog(entity: any) {
    let dialogRef = this.dialog.open(SampleFormDialog, {height:'850px', width: '600px'});
    dialogRef.componentInstance.config.entity = entity
    dialogRef.componentInstance.config.issueSample = true
    dialogRef.componentInstance.config.sampleList = this.sampleList.filter(sample => sample.TMP_CHECK)
    dialogRef.afterClosed().subscribe(result => {
      //this.sampleList = this.sampleList.filter(sample => !sample.TMP_CHECK)
      this.sampleList = []
      this.getSampleListByBatch('')
    });
  }

  clearForm(){
    console.log("clear form")
  }
}
