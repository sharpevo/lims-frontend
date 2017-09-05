import {Component, Input} from '@angular/core'
import {EntityService} from './service'

@Component({
  selector: 'entity-tostring',
  templateUrl: './tostring.component.html',
})
export class EntityToStringComponent {
  @Input('entity') entity
  @Input('entityId') entityId
  label: string = ""
  constructor(private entityService: EntityService) {}

  ngOnInit(){
    if (this.entityId){
      this.entityService.retrieveBy({
        "_id": this.entityId, // "id" does not exist in database
      }).subscribe(data => {
        this.entity = data[0]
        this.getEntityLabel()
      })
    } else {
      this.getEntityLabel()
    }
  }

  getEntityLabel(){

    // Get all the attributes and check whether the `SYS_IS_ENTITY_LABEL` is
    // true, which is assigned while the creation of the attribute
    this.entityService.retrieveAttribute(this.entity.id)
    .subscribe(attributes => {

      // As default, there's some entity does not have any predefined
      // attribute, but has an `label` attribute which will be used as label
      // in preference to the id
      if (this.entity['SYS_LABEL']){
        this.label = this.entity[this.entity['SYS_LABEL']]
      } else if (this.entity['label']){
        this.label = this.entity.label
      } else {
        this.label = this.entity.id
      }

      if (!this.label) {
        // No way to break Angular forEach, so native for-loop is better
        for (let attribute of attributes){
          if (attribute['SYS_IS_ENTITY_LABEL']) {
            this.label = this.entity[attribute['SYS_CODE']]
            return
          }
        }
      }

    })
  } 
}
