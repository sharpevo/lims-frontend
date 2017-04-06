import {Component,Input} from '@angular/core'
import {EntityService} from './service'

@Component({
  selector: 'entity-select-list',
  templateUrl: './select.list.component.html',
})

export class EntitySelectListComponent {
  @Input('object') object // object to generate the form
  @Input('attribute') attribute // used in the template for ngModel
  @Input('placeholder') placeholder
  @Input('ceilingEntityId') entityId
  entityList: any[] = []

  constructor(
    private entityService: EntityService,
  ){}

  ngOnInit(){
    this.getEntityList()
    console.log("placeholder:", this.placeholder)
    if (!this.placeholder){
      this.getEntityPlaceholder()
    }
  }

  getEntityList(){
    this.entityService.retrieveEntity(this.entityId, "collection")
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
