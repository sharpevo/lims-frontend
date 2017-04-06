import {Component,Input} from '@angular/core'
import {EntityService} from './service'
import {GenreService} from '../genre/service'
import {MdSnackBar} from '@angular/material'
import {ActivatedRoute, Router} from '@angular/router'

@Component({
  selector: 'entity-form-inline',
  templateUrl: './form.inline.component.html',
})

export class EntityFormInlineComponent {
  @Input('entity') entity // object to generate the form

  genre: any = {}
  attributeList: any[] = []

  instance: any = {}

  attrList: any = {}
  attrEntityList: any = {}

  entityList: any[] = []

  attributeMap: Object = {}
  //attributeMap: {[key: string]:any} = {}

  constructor(
    private entityService: EntityService,
    private genreService: GenreService,
  ){}

  ngOnInit(){
    //if (this.entity){

    console.log(this.entity)
    //this.renderForm()
    //this.getGenreList()
    this.getEntityList()
    //this.getAttributeList(this.entity.id)
    //}
    this.getAttributeList(this.entity.id)
  }

  //getGenreList(){
  //this.entityService.retrieveGenre(this.entity.id)
  //.subscribe(data => {
  //this.genreList = data
  //})
  //}

  getEntityList(){
    this.entityService.retrieveEntity(this.entity.id, "")
    .subscribe(data => {
      console.log(data)
      this.entityList = data
    })
  }

  getAttributeList(entityId: string){

    // get the sub entities
    this.entityService.retrieveEntity(this.entity.id, "")
    .subscribe(data => {
      data.forEach(entity => {
        // get attributes for each sub entity
        this.entityService.retrieveAttribute(entity.id)
        .subscribe(attribute => {
          if (attribute.SYS_TYPE = "entity"){
            // get the entity option list
            this.entityService.retrieveEntity(entity.id, "")
            .subscribe(subentity => {
              this.attrEntityList[attribute.SYS_CODE] = subentity
            })
          }

          this.attributeMap[entity.SYS_IDENTIFIER] = data
        })
      })
    })
  }

  getAttributeList2(genreId: string){
    console.log('Get attribute of entity:', genreId)
    this.entityService.retrieveAttribute(this.entity.id)
    .subscribe(data => {
      console.log(data)
      this.attributeList = data
      data.forEach(attribute => {
        console.log(attribute)
        if (attribute.SYS_TYPE = "entity"){

          this.entityService.retrieveEntity(this.entity.id, "")
          .subscribe(data => {
            this.attrEntityList[attribute.SYS_CODE] = data
          })

          // retrieve entity list for the entity type attribute
          //this.entityService.retrieveByGenreAndIdentifier(attribute.SYS_TYPE_ENTITY.SYS_IDENTIFIER, attribute.SYS_FLOOR_ENTITY_TYPE)
          //.subscribe(data => {
          //console.log(data)
          //this.attrEntityList[attribute.SYS_CODE] = data
          //})

        }
      })

    })
  }

  renderForm(){
    let genreIdentifier = this.entity.SYS_IDENTIFIER.substr(0, this.entity.SYS_IDENTIFIER.lastIndexOf("/")+1)
    console.log(genreIdentifier)
    this.genreService.retrieveByIdentifier(genreIdentifier)
    .subscribe(
      data => {
        this.genre = data[0]
        console.log(this.genre)
        this.instance["genre"] = this.genre.category
        //console.log(this.genre)
        this.instance["identifier"] = this.genre.identifier

        this.genre.attributes = this.genre.attributes.sort((a,b) => {
          //console.log(a.order)
          //console.log(b.order)
          if (a.order < b.order){
            return -1
          } else {
            return 1
          }
        })
        console.log(this.genre.attributes)

        // genre.attributes looks like
        //
        // code:"material"
        // createdAt:"2017-03-16T02:28:44.532Z"
        // genre:"58c8ff5192933c3d1292b063"
        // id:"58c9f85c92933c3d1292b06a"
        // label:"物料名称"
        // order:3
        // type:"entity"
        // typeEntityId:"58b8e1d75853938c3ec46134"
        // typeEntityLevel:"domain"
        // typeEntityRef:true
        // typeEntityTarget:"collection"
        // updatedAt:"2017-03-16T02:28:44.755Z"

        for (let attr of this.genre.attributes){

          // retrieve entity list for "entity" attribute
          if (attr.type == "entity"){
            this.entityService.retrieveById(attr.typeEntityId)
            .subscribe(
              data => {
                this.genreService.retrieveByIdentifier(data.identifier+'/')
                .subscribe(
                  data => {
                    this.attrList[attr.code] = data[0].attributes
                  }
                )

                // Get target entity, "object" as default
                //this.entityService.retrieveEntityByGenreAndIdentifier(
                //attr["typeEntityTarget"]?attr["typeEntityTarget"]:"object",
                //data.identifier)
                //.subscribe(
                //data => {
                //this.attrEntityList[attr.code] = data
                //}
                //)
                //
                // Return the object even specified with other target
                // in order to implement BoM parse for PM and Prod.
                // Target is used to create entities which is not inline.
                //
                // Get the entity specified by PM when creating BoM, Data looks like
                //
                //    createdAt:"2017-03-16T02:38:53.862Z"
                //    genre:Object
                //    genres:Array[0]
                //    id:"58c9fabd92933c3d1292b06b"
                //    identifier:"/BOM/MANUFACTURING/BOM_SET/EXTRACT_ASSIGN_KAPA"
                //    label_expr:"${id}"
                //    material:"58b8e22b5853938c3ec4613a"
                //    updatedAt:"2017-03-16T02:38:53.862Z"
                //    workcenter:"58c33b3892933c3d1292b01b"
                //
                // The above code will return 
                // For workcenter:
                //    - /WORKCENTER/PRODUCT/EXTRACT/V1
                //    - /WORKCENTER/PRODUCT/QC/V1
                //    - /WORKCENTER/PRODUCT/LIBRARY/V1
                //    - 17R01001
                //    - 17R00221
                //    - 17R00053
                // For material: 
                //    - Kapa Hifi
                //    - Gloves
                //    - Tips
                //    - Primer
                //
                // The following code will return
                // For workcenter:
                //    - /WORKCENTER/PRODUCT/EXTRACT/V1
                //    - 17R00221
                //    - 17R00053
                // For material:
                //    - Kapa-20161213J
                //    - Kapa-20170308J
                this.entityService.retrieveById(this.entity[attr.code])
                .subscribe(
                  data => {
                    // Get the option list
                    this.entityService.retrieveEntityByGenreAndIdentifier(
                      "object",
                      data.identifier)
                      .subscribe(
                        data => {
                          this.attrEntityList[attr.code] = data
                        }
                      )
                  }
                )
              }
            )
          }
        }
      }
    )
  }

}


