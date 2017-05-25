import {Component, Input} from '@angular/core'
import {MdDialog, MdDialogRef} from '@angular/material'
import {GenreFormDialog} from '../genre/form.dialog.component'
import {EntityFormDialog} from '../entity/form.dialog.component'
import {AttributeFormDialog} from '../attribute/form.dialog.component'

import {EntityService} from '../entity/service'

@Component({
  selector: 'tree-view',
  templateUrl: './component.html',
})

export class TreeViewComponent {
  @Input() hierarchy: any[]
  @Input() entityList: any[]
  @Input() identifierPrefix: string
  @Input() parentEntity
  selectedOption: string
  constructor(
    public dialog: MdDialog,
    private entityService: EntityService
  ){
    if (!this.hierarchy){
      this.hierarchy = []
    }
    let t1 = new Hierarchy("t1", [])
    let t2 = new Hierarchy("t2", [])
    let test1 = new Hierarchy("test1", [])
    let test2 = new Hierarchy("test2", [t1, t2])
    let test = new Hierarchy("test", [test1, test2])
    this.hierarchy.push(test)
    let another1 = new Hierarchy("another1", [])
    let another2 = new Hierarchy("another2", [])
    let another = new Hierarchy("another", [another1, another2])
    this.hierarchy.push(another)

  }

  ngOnInit(){
    this.getNextEntityList()
    //this.getNextEntityListByEntity(this.parentEntity)
  }

  // TODO: get SYS_LABEL from Genre and assigne to each Entity
  getNextEntityList(){
    let identifier = ""
    if (!this.identifierPrefix){
      //this.identifierPrefix = ""
      identifier = "^/$"
    } else if (this.identifierPrefix == "/"){
      //identifier = `^/[a-zA-Z0-9_\.]{1,50}$`
      identifier = `^/[a-zA-Z0-9_\.]%2B$`
    } else {
      identifier = `^${this.identifierPrefix}/[a-zA-Z0-9_\.]*$`
    }
    //console.log(this.identifierPrefix)
    //let identifier = `^${this.identifierPrefix}/[a-zA-Z0-9_\.]*$`
    this.entityService.retrieveByIdentifier(identifier)
    .subscribe(
      data => {
        this.entityList = data
      }
    )
  }

  getNextEntityListByEntity(entity){
    let targetEntityType = ''
    if (!this.parentEntity){
      this.entityService.retrieveByType('domain')
      .subscribe(
        data => {
          this.entityList = data
        }
      )
    } else {
      switch (this.parentEntity['SYS_ENTITY_TYPE']) {
        case 'domain':
          targetEntityType = 'class'
        break
        case 'class':
          targetEntityType = 'collection'
        break
        case 'collection':
          targetEntityType = 'object'
        break
        default:
          console.log("nothing to expand")

      }
      this.entityService.retrieveEntity(entity.id, targetEntityType)
      .subscribe(
        data => {
          this.entityList = data
        }
      )
    }
  }

  deleteObjectById(entityId: string, entityList: any[]){
    this.entityService.deleteById(entityId)
    .subscribe(data => {
      console.log('Delete entity:', data)
    })
  }

  openNewGenreDialog(entity: any) {
    let dialogRef = this.dialog.open(GenreFormDialog, {height:'850px', width: '600px'});
    dialogRef.componentInstance.config.entity = entity
    dialogRef.afterClosed().subscribe(result => {
      this.selectedOption = result;
    });
  }

  openNewEntityDialog(entity: any) {
    let dialogRef = this.dialog.open(EntityFormDialog, {height:'850px', width: '600px'});
    dialogRef.componentInstance.config.entity = entity
    dialogRef.afterClosed().subscribe(result => {
      this.selectedOption = result;
    });
  }

  openNewAttributeDialog(entity: any) {
    let dialogRef = this.dialog.open(AttributeFormDialog, {height:'850px', width:'600px'});
    dialogRef.componentInstance.config.entity = entity
    dialogRef.afterClosed().subscribe(result => {
      this.selectedOption = result;
    });
  }
}

class Hierarchy{
  name: string
  children: any[]
  expanded: boolean
  checked: boolean
  constructor(name, children){
    this.name = name
    this.children = children
    this.expanded = false
    this.checked = false
  }

  toggle(){
    this.expanded = !this.expanded
  }

  check(){
    this.checked = !this.checked
    this.checkRecursive(this.checked)
  }

  checkRecursive(state){
    this.children.forEach( d => {
      d.checked = state
      d.checkRecursive(state)
    })
  }

}
