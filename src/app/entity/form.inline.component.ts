import {Component, Input} from '@angular/core'
import {DatePipe} from '@angular/common'
import {MdSnackBar} from '@angular/material'

import {AttributeService} from '../attribute/service'
import {GenreService} from '../genre/service'
import {EntityService} from './service'

@Component({
  selector: 'entity-form-inline',
  templateUrl: './form.inline.component.html',
})
export class EntityFormInlineComponent {
  @Input('entity') entity
  object: any = {}
  attributeList: any[] = []
  constructor(
    private entityService: EntityService) {}

    ngOnInit(){
      this.getAttributeList()
    }

    getAttributeList(){
      this.entityService.retrieveAttribute(this.entity.id)
      .subscribe(data => {
        console.log(data)
        data.forEach(attribute => {
          this.object[attribute.SYS_CODE] = this.entity[attribute.SYS_CODE]
        })
        this.attributeList = data
      })
    }


}
