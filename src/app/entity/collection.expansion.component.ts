import {Component,Input} from '@angular/core'
import {EntityService} from './service'
import {GenreService} from '../genre/service'
import {MdSnackBar} from '@angular/material'
import {ActivatedRoute, Router} from '@angular/router'

@Component({
  selector: 'entity-collection-expansion',
  templateUrl: './collection.expansion.component.html',
})

export class EntityCollectionExpansionComponent {
  @Input('entity') entity // object to generate the form
  @Input('object') object

  instance: any = {}
  entityList: any[] = []

  constructor(
    private entityService: EntityService,
    private genreService: GenreService,
  ){}

  ngOnInit(){
    this.getEntityList()
  }

  getEntityList(){
    this.entityService.retrieveEntity(this.entity.id, "")
    .subscribe(data => {
      console.log(data)
      this.entityList = data
    })
  }

}


