import {Component, Input} from '@angular/core'
import {ActivatedRoute, Router} from '@angular/router'

import {EntityService} from './service'
import {AttributeService} from '../attribute/service'

@Component({
  selector: 'entity-info-inline',
  templateUrl: './info.inline.component.html',
})
export class EntityInfoInlineComponent{
  @Input() entity
  attributeList: any[] = []

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entityService: EntityService,
    private attributeService: AttributeService,
  ){}

  ngOnInit(){
    this.getAttributeList()
  }

  getAttributeList(){
    this.entityService.retrieveAttribute(this.entity.id)
    .subscribe(data => {
      console.log(this.entity)
      console.log("<<", data)
      this.attributeList = data
    })
  }

}
