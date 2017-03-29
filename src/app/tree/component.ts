import {Component, Input} from '@angular/core'
import {MdDialog, MdDialogRef} from '@angular/material'
import {NewEntityDialog} from '../entity/create.dialog.component'
import {NewAttributeDialog} from '../attribute/form.dialog.component'

import {EntityService} from '../entity/service'

@Component({
  selector: 'tree-view',
  templateUrl: './component.html',
})

export class TreeViewComponent {
  @Input() hierarchy: any[]
  @Input() entityList: any[]
  @Input() identifierPrefix: string
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
  }

  getNextEntityList(){
    if (!this.identifierPrefix){
      this.identifierPrefix = ""
    }
    //console.log(this.identifierPrefix)
    let identifier = `^${this.identifierPrefix}/[a-zA-Z0-9_]*$`
    this.entityService.retrieveByIdentifier(identifier)
    .subscribe(
      data => {
        this.entityList = data
      }
    )
  }

  openNewEntityDialog() {
    let dialogRef = this.dialog.open(NewEntityDialog);
    dialogRef.afterClosed().subscribe(result => {
      this.selectedOption = result;
    });
  }

  openNewAttributeDialog(entity: any) {
    let dialogRef = this.dialog.open(NewAttributeDialog, {width:'600px'});
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
