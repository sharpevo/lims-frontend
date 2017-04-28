import {Component, Input} from '@angular/core'
import {ActivatedRoute, Router} from '@angular/router'

import {EntityService} from '../entity/service'
import {AttributeService} from '../attribute/service'

@Component({
  selector: 'sample-info-inline',
  templateUrl: './sample.inline.component.html',
})
export class SampleInfoInlineComponent{
  @Input() entity
  @Input() checkedEntityList
  @Input() sampleList
  attributeList: any[] = []

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entityService: EntityService,
    private attributeService: AttributeService,
  ){}

  ngOnInit(){
    // It is shared with Dashboard and Overview at least, the former one will
    // provide a checkedEntityList and the latter one does not
    // As a result, selection on Overview will be overwrited since the
    // initializatoin
    //if (!this.checkedEntityList){
    //this.checkedEntityList = []
    //}
    //this.entity['checked']=false
    //this.getAttributeList()
  }

  getAttributeList(){
    this.entityService.retrieveAttribute(this.entity.id)
    .subscribe(data => {
      this.attributeList = data
    })
  }

  checkEntity(){
    if (!this.entity.checked){
      this.checkedEntityList.push(this.entity)
    } else {
      for (let i=0; i<this.checkedEntityList.length; i++){
        if (this.checkedEntityList[i].id == this.entity.id){
          this.checkedEntityList.splice(i, 1)
          break
        }
      }
    }
  }
}
