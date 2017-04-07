import {Component,Input} from '@angular/core'
import {EntityService} from './service'

@Component({
  selector: 'entity-select-list',
  templateUrl: './select.list.component.html',
})

export class EntitySelectListComponent {
  @Input('object') object // object to generate the form
  @Input('attribute') attribute // used in the template for ngModel
  @Input('ceilingEntityId') entityId
  @Input('generated') generated // get placeholder and collection
  entityList: any[] = []
  placeholder: string = ""
  floorEntityType: string = ""

  constructor(
    private entityService: EntityService,
  ){}

  ngOnInit(){
    if (!this.object){
      this.object = {}
    }
    if (this.generated){
      this.getEntityPlaceholder()
      this.floorEntityType = "collection"
    } else{
      this.placeholder = this.attribute[this.attribute['SYS_LABEL']]
      this.floorEntityType = this.attribute['SYS_FLOOR_ENTITY_TYPE']
    }
    this.getEntityList()
  }

  getEntityList(){
    this.entityService.retrieveEntity(this.entityId, this.floorEntityType)
    .subscribe(data => {
      this.entityList = data
      console.log(data)
    })
  }

  getEntityPlaceholder(){
    this.entityService.retrieveById(this.entityId)
    .subscribe(data => {
      this.placeholder = data[data['SYS_LABEL']]
    })
  }
}
