import {Component} from '@angular/core'
import {DatePipe} from '@angular/common'
import {MdDialog, MdDialogRef} from '@angular/material';
import {MdSnackBar} from '@angular/material'

import {AttributeService} from '../attribute/service'
import {GenreService} from '../genre/service'
import {EntityService} from './service'

@Component({
  selector: 'new-entity-dialog',
  templateUrl: './form.dialog.component.html',
})
export class EntityFormDialog {
  config: any = {}
  object: any = {}
  genre: any = {}
  genreList: any[] = []
  attributeList: any[] = []
  entityList: any[] = []
  parentMap: any = {}
  categoryList = [
    {value: "domain", title: "Domain"},
    {value: "class", title: "Class"},
    {value: "collection", title: "Collection"},
    {value: "object", title: "Object"},
  ]
  constructor(
    private snackBar: MdSnackBar,
    private genreService: GenreService,
    private entityService: EntityService,
    private attributeService: AttributeService,
    public dialogRef: MdDialogRef<EntityFormDialog>) {}

    ngOnInit(){
      this.getGenreListByEntityId(this.config.entity.id)
      this.generateEntityCode()
      this.generateEntityType()
    }

    clearForm(){
      this.object = {}
      this.generateEntityCode()
      this.generateEntityType()
    }

    generateEntityCode(){
      this.object.TMP_CODE = this.config.entity.SYS_CODE + '.' +
        new DatePipe('en-US').transform(new Date(), 'yyyyMMddhhmmss')
    }

    generateEntityType(){
      switch (this.config.entity.SYS_ENTITY_TYPE) {
        case "domain":
          this.object.SYS_ENTITY_TYPE = "class"
        break
        case "class":
          this.object.SYS_ENTITY_TYPE = "collection"
        break
        case "collection":
          this.object.SYS_ENTITY_TYPE = "object"
        break
        default:
          this.object.SYS_ENTITY_TYPE = ""
      }
    }

    generateEntityLabel(){
      this.attributeList.forEach(attribute => {
        if (attribute.SYS_IS_ENTITY_LABEL) {
          console.log("get label attribute:", attribute.SYS_CODE)
          this.object.SYS_LABEL = attribute.SYS_CODE
        }
      })
      if (!this.object.SYS_LABEL) {
        console.log("not valid label for the genre:", this.genre)
      }
    }

    createObject(){
      this.object.SYS_IDENTIFIER = this.genre.SYS_IDENTIFIER +
        this.object.TMP_CODE
      delete this.object.TMP_CODE

      //this.attributeList.forEach(attribute =>{
      //if (attribute.SYS_TYPE == "entity" && 
      //!attribute["SYS_TYPE_EXPANDABLE"]) {
      //this.attributeList[attribute.SYS_CODE].forEach(entity => {
      //console.log(entity)
      //})
      //}
      //})

      if (!this.object.id){
        this.entityService.create(this.object)
        .subscribe(
          data => {
            //this.getObject()
            this.object = {}
            this.object.SYS_GENRE = this.genre.id
            this.generateEntityCode()
            console.log('Add Entity:', data)
            this.showMessage("Added")
            //this.getEntityByGenre(data.SYS_GENRE_IDENTIFIER)
            this.getEntityByGenre(data.SYS_GENRE)
          }
        )
      } else {
        this.entityService.update(this.object)
        .subscribe(
          data => {
            //this.getObject()
            this.object = {}
            this.object.SYS_GENRE = this.genre.id
            this.generateEntityCode()
            console.log('Upadte Entity:', data)
            this.showMessage("Updated")
            //this.getEntityByGenre(data.SYS_GENRE_IDENTIFIER)
            this.getEntityByGenre(data.SYS_GENRE)
          }
        )

      }
    }

    getGenreListByEntityId(entityId: string){
      //this.genreService.retrieveByEntityId(entityId)
      this.entityService.retrieveGenre(entityId)
      .subscribe(
        data => {
          this.genreList = data
        }
      )
    }

    getAttributesByGenre(genre: any){
      this.genre = genre
      let genreId = genre.id
      //this.attributeService.retrieveByGenreId(genreId)
      this.genreService.retrieveAttribute(genreId)
      .subscribe(
        data => {
          console.log(data)
          data.forEach(attribute => {
            switch (attribute.SYS_TYPE){
              case "entity":
                //if (attribute.SYS_TYPE_ENTITY_REF){
                //// get the identifier of the entity
                //// TODO: save SYS_IDENTIFIER instead of ID seems better
                //// or automate populate
                //this.entityService.retrieveById(attribute.SYS_TYPE_ENTITY.id)
                //.subscribe(data => {
                //// get the entity list
                //if (!attribute.SYS_FLOOR_ENTITY_TYPE){
                //attribute.SYS_FLOOR_ENTITY_TYPE = "object"
                //}
                //this.entityService.retrieveByIdentifierAndCategory(
                //data.SYS_IDENTIFIER,
                //attribute.SYS_FLOOR_ENTITY_TYPE)
                //.subscribe(data => {
                //// compose a new key
                //attribute[attribute.SYS_CODE + "_ENTITY_LIST"] = data
                //})
                //})


                //}else {

                //}

                if (!attribute.SYS_TYPE_ENTITY_REF) {
                this.parentMap[attribute.SYS_CODE] = {}
              }

              break
              default:
                console.log("pass attribute type", attribute.SYS_TYPE)
            }

          })
          this.attributeList = data.sort(
            (a,b) => {
              if (a.SYS_ORDER > b.SYS_ORDER) {
                return 1
              } else {
                return -1
              }
            }
          )
          this.generateEntityLabel()
        }
      )

      this.getEntityByGenre(genreId)
    }

    //getEntityByGenre(genreIdentifier: string){
    //let identifier = `^${genreIdentifier}[a-zA-Z0-9_\.]*$`
    //this.entityService.retrieveByIdentifier(identifier)
    getEntityByGenre(genreId: string){
      this.genreService.retrieveEntity(genreId)
      .subscribe(
        data => {
          this.entityList = data.sort(
            (a,b) => {
              if (a.updatedAt > b.updatedAt) {
                return 1
              } else {
                return -1
              }
            }
          )
        }
      )
    }

    deleteEntityById(entityId: string){
      this.entityService.deleteById(entityId)
      .subscribe(
        data => {
          console.log('Delete Entity:', data)
          this.getEntityByGenre(data.SYS_GENRE_IDENTIFIER)
        }
      )
    }

    editEntity(entity: any){
      // deep copy or the SYS_GENRE is overwrited
      this.object = Object.assign({}, entity)
      console.log(entity)
      let codes = entity.SYS_IDENTIFIER.split("/")
      this.object.TMP_CODE = codes[codes.length - 1]
      this.object.TMP_GENRE_IDENTIFIER = entity.SYS_GENRE_IDENTIFIER

    }

    showMessage(msg: string) {
      this.snackBar.open(msg, 'UNDO', {duration: 3000});
    }


}
