import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {MdDialog, MdDialogRef} from '@angular/material'
import {MdSnackBar} from '@angular/material'

@Component({
  selector: 'meterial-overview',
  styles: [`
    .disabled-panel{
    opacity: 0.3;
    pointer-events: none;
    }
    .mat-select{
    margin-top:-9px;
    }
    `
  ],
  templateUrl: './overview.component.html',
})
export class MaterialOverviewComponent{

  entity: any = {}
  materialObjectList: any[] = []
  skip = 0
  queryCode: string = ''
  queryValue: string = ''
  showPanel: any = {}
  sampleMap: any = {}
  total: string = ''

  constructor(
    public dialog: MdDialog,
    private entityService: EntityService,
    private snackBar: MdSnackBar,
  ){}

  ngOnInit(){
    this.entityService.retrieveByIdentifierFull(
      "/MATERIAL")
      .subscribe(data => {
        this.entity = data[0]
        this.getMaterialList()
      })
  }

  getMaterialList(){
    let option = "&limit=10&sort=-createdAt&skip=" + this.skip
    if (this.queryCode == '' && this.queryValue != '') {
      this.showMessage("Please take an attribute.")
      return
    }
    if (this.queryCode != '' && this.queryValue != '') {
      option += `&where={"${this.queryCode}":{"regex":".*${this.queryValue}.*"}}`
    }
    this.entityService.retrieveEntity(
      this.entity.id,
      "class",
      option
    )
    .subscribe(data => {
      this.materialObjectList = data
      data.forEach(material => {
        material['TMP_SKIP'] = 0
        this.entityService.retrieveEntity(material.id, 'collection')
        .subscribe(data => {
          material['TMP_LOT_LIST'] = data
        })
      })
    })
  }

  nextPage(){
    this.skip += 10
    this.getMaterialList()
  }

  prevPage(){
    this.skip -= 10
    if (this.skip <= 0) {
      this.skip = 0
    }
    this.getMaterialList()
  }

  clearQuery(){
    this.queryCode = ''
    this.queryValue = ''
    this.getMaterialList()
  }

  showMessage(msg: string) {
    this.snackBar.open(msg, 'OK', {duration: 3000});
  }

  openPanel(lotId: string){
    Object.keys(this.showPanel).forEach(key => {
      if (key == lotId){
        this.showPanel[key] = true
      } else {
        this.showPanel[key] = false
      }
    })

    this.entityService.retrieveEntity(lotId, 'object')
    .subscribe(data => {
      this.sampleMap[lotId] = data
      let sum = 0
      data.forEach(obj => {
        sum += obj.SYS_QUANTITY
      })
      this.total = Number(sum).toFixed(2)
    })
  }

  closePanel(lotId: string){
    this.showPanel[lotId] = false
  }

  isExpanded(lotId: string){
    return this.showPanel[lotId]
  }
}
