import {Component,Input} from '@angular/core'
import {EntityService} from './service'

@Component({
  selector: 'entity-select-list',
  templateUrl: './select.list.component.html',
})

export class EntitySelectListComponent {
  @Input('object') object // object to generate the form
  @Input('attribute') attribute
  @Input('ceilingEntity') entity
  entityList: any[] = []
  label: string = ""

  constructor(
    private entityService: EntityService,
  ){}

  ngOnInit(){
    console.log(this.entity)
    this.getEntityList()
    this.getEntityLabel()
  }

  getEntityList(){
    console.log(this.entity)
    this.entityService.retrieveEntity(this.entity[this.attribute['SYS_CODE']], "collection")
    .subscribe(data => {
      this.entityList = data
      console.log(data)
    })
  }

  getEntityLabel(){
    this.entityService.retrieveById(this.entity[this.attribute['SYS_CODE']])
    .subscribe(data => {
      this.label = data[data['SYS_LABEL']]
    })
  }
}
