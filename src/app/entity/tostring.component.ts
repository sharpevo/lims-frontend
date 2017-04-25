import {Component, Input} from '@angular/core'
import {EntityService} from './service'

@Component({
  selector: 'entity-tostring',
  templateUrl: './tostring.component.html',
})
export class EntityToStringComponent {
  @Input('entity') entity
  label: string = ""
  constructor(private entityService: EntityService) {}

  ngOnInit(){
    this.getEntityLabel()
  }

  getEntityLabel(){

    // Get all the attributes and check whether the `SYS_IS_ENTITY_LABEL` is
    // true, which is assigned while the creation of the attribute
    this.entityService.retrieveAttribute(this.entity.id)
    .subscribe(attributes => {

      // No way to break Angular forEach, so native for-loop is better
      for (let attribute of attributes){
        if (attribute['SYS_IS_ENTITY_LABEL']) {
          this.label = this.entity[attribute['SYS_CODE']]
          return
        }
      }

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
    })
  } 
}
