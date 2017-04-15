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
  @Input('optionLevel') optionLevel
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

    this.getEntityPlaceholder()
    this.floorEntityType = this.optionLevel
    this.getEntityList()
  }

  getEntityList(){
    //console.log('>>floor:', this.floorEntityType)
    //console.log('>>attribute:', this.attribute)
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
