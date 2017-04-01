import {Component} from '@angular/core'
import {MdDialog, MdDialogRef} from '@angular/material';

import {AttributeService} from './service'
import {GenreService} from '../genre/service'
import {EntityService} from '../entity/service'

@Component({
  selector: 'create-attribute-dialog',
  templateUrl: './form.dialog.component.html',
})
export class AttributeFormDialog {
  config: any = {} // error occurs at the parent component without initialization
  genreList: any[] = []
  entityCandidateList: any[] = []
  attributeList: any[]
  object: any = {}

  objectTypeList = [
    {value: "string", title: "String"},
    {value: "text", title: "Text"},
    {value: "number", title: "Number"},
    {value: "list", title: "Array"},
    {value: "boolean", title: "Boolean"},
    {value: "date", title: "Date"},
    {value: "datetime", title: "Date with time"},
    {value: "file", title: "File"},
    {value: "entity", title: "Entity (single)"},
    {value: "parent", title: "Entity (multiple)"},
    {value: "container", title: "Entity (componet)"},
  ]

  categoryList = [
    {value: "domain", title: "Domain"},
    {value: "class", title: "Class"},
    {value: "collection", title: "Collection"},
    {value: "object", title: "Object"},
  ]

  constructor(
    private genreService: GenreService,
    private entityService: EntityService,
    private attributeService: AttributeService,
    public dialogRef: MdDialogRef<AttributeFormDialog>){}

    ngOnInit(){
      this.getGenreListByEntityId(this.config.entity.id)
    }

    createObject(){
      //let genreId = this.object.genreId
      //delete this.object.genreId

      // create
      if (!this.object.id){
        this.attributeService.create(this.object)
        .subscribe(
          data => {
            console.log('Add Attribute:', data)
            let genre = this.object.SYS_GENRE
            this.getAttributesByGenre(this.object.SYS_GENRE)
            this.object = {}
            this.object.SYS_GENRE = genre
          },
        )
      } else { // update
        this.attributeService.update(this.object)
        .subscribe(
          data => {
            console.log('Update Attribute:', data)
            let genre = this.object.SYS_GENRE
            this.getAttributesByGenre(this.object.SYS_GENRE)
            this.object = {}
            this.object.SYS_GENRE = genre
          },
        )
      }
    }

    getGenreListByEntityId(entityId: string){
      this.genreService.retrieveByEntityId(entityId)
      .subscribe(
        data => {
          this.genreList = data
        }
      )
    }

    getEntityListByType(entityType: string){
      this.entityService.retrieveByType(entityType)
      .subscribe(
        data => {
          this.entityCandidateList = data
        }
      )
    }

    getAttributesByGenre(genreId: string){
      this.attributeService.retrieveByGenreId(genreId)
      .subscribe(
        data => {
          this.attributeList = data.sort(
            (a,b) => {
              if (a.SYS_ORDER > b.SYS_ORDER) {
                return 1
              } else {
                return -1
              }
            }
          )
        }
      )
    }

    deleteAttributeById(attributeId: string){
      this.attributeService.deleteById(attributeId)
      .subscribe(
        data => {
          console.log('Delete Attribute:', data)
          this.getAttributesByGenre(this.object.SYS_GENRE)
        }
      )
    }

    editAttribute(attribute: any){
      // deep copy or the SYS_GENRE is overwrited
      this.object = Object.assign({}, attribute)
      this.object.SYS_GENRE = attribute.SYS_GENRE.id
    }

}
