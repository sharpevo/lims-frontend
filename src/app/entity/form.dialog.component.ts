import {Component} from '@angular/core'
import {DatePipe} from '@angular/common'
import {MatDialog, MatDialogRef} from '@angular/material';
import {MatSnackBar} from '@angular/material'

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
  genreId: string = ""
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

  genericWorkcenterList: any[] = []
  genericGenreList: any[] = []
  genericAttributeList: any[]  = []

  // fix undefined focus error
  genericWorkcenter: any = {}
  genericGenre: any = {}
  genericAttribute: any = {}

  auxiliaryAttributeList: any[] = []

  constructor(
    private snackBar: MatSnackBar,
    private genreService: GenreService,
    private entityService: EntityService,
    private attributeService: AttributeService,
    public dialogRef: MatDialogRef<EntityFormDialog>) {}

    ngOnInit(){
      this.getGenreList()
      this.generateEntityCode()
      this.generateEntityType()

      this.getGenericWorkcenterList()
    }

    clearForm(){
      this.object = {}
      this.generateEntityCode()
      this.generateEntityType()
    }

    initObject(){
      this.object = {}
      this.object.SYS_GENRE = this.genreId
      this.generateEntityType()
      this.generateEntityCode()
      this.getEntity()
    }

    generateEntityCode(){
      this.object.TMP_CODE = this.config.entity.SYS_CODE + '.' +
        new DatePipe('en-US').transform(new Date(), 'yyyyMMddHHmmss')
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
          //console.log("get label attribute:", attribute.SYS_CODE)
          this.object.SYS_LABEL = attribute.SYS_CODE
        }
      })
      if (!this.object.SYS_LABEL) {
        console.log("not valid label for the genre:", this.genreId)
      }
    }
    createObject2(){

      this.object.SYS_IDENTIFIER = this.config.entity.SYS_IDENTIFIER + "/" +
        this.object.TMP_CODE
      delete this.object.TMP_CODE

      console.log("OBJECT:", this.object)
      console.log("PARENT_MAP:", this.parentMap)
    }

    createObject(){

      if (this.object['SYS_SAMPLE_CODE']){
        this.object.TMP_CODE = this.object['SYS_SAMPLE_CODE']
      }
      let TMP_CODE = this.object.TMP_CODE

      // Get SYS_IDENTIFIER from the entity instead of the gere, in order to
      // enable creating entities with shared genre but under different entity.
      this.object.SYS_IDENTIFIER = this.config.entity.SYS_IDENTIFIER + "/" +
        this.object.TMP_CODE
      delete this.object.TMP_CODE

      console.log(this.object)
      console.log(this.parentMap)

      if (!this.object.id){
        this.entityService.create(this.object)
        .subscribe(data => {

          this.upsertSubEntities(
            data,
            TMP_CODE,
            (subMaterial) => {
              this.entityService.create(subMaterial)
              .subscribe(data =>{
                console.log("merged entity:", data)
                // TODO: Deduct the quantity in the material collection
                // after the merger
              })
            })
            this.initObject()
            console.log('Add Entity:', data)
            this.showMessage("Added")

        })
      } else {
        this.entityService.update(this.object)
        .subscribe(data => {

          this.upsertSubEntities(
            data, // id and SYS_GENRE
            TMP_CODE,
            (subMaterial) => {

              this.entityService.retrieveByIdentifierFull(subMaterial.SYS_IDENTIFIER)
              .subscribe(entity => {
                subMaterial.id = entity[0].id

                this.entityService.update(subMaterial)
                .subscribe(material =>{
                  console.log("merged entity:", material)
                  // TODO: Deduct the quantity in the material collection
                  // after the merger

                })
              })

            })

            this.initObject()
            console.log('Upadte Entity:', data)
            this.showMessage("Updated")
        })

      }
    }

    upsertSubEntities(data, TMP_CODE, callback){
      let object = Object.assign({}, this.object)

      // Get the keys for each kind of BoM/Routing
      // e.g. "bom", "bill_of_material"
      Object.keys(this.parentMap).forEach(key => {

        let SYS_DATE_SCHEDULED = new Date()
        let DATE_EXISTS = false

        // Get the bom object id, which is used as the key of the actual
        // usage, e.g., <bom object id>
        Object.keys(this.parentMap[key]).forEach((entityId, index) =>{

          // `usage` is the inputs from user and contains SYS_QUANT,
          // SYS_SOURCE, etc.
          let usage = this.parentMap[key][entityId]

          // only process checked Material or Workcenter
          if (usage['SYS_CHECKED']){
            //console.log('process checked entry:', usage)

            // Calculate SYS_DATE_SCHEDULED// {{{
            //
            if (!DATE_EXISTS){
              if (object['SYS_DATE_SCHEDULED']){
                SYS_DATE_SCHEDULED = new Date(object['SYS_DATE_SCHEDULED'])
                //console.log('DATE not exists, but object exist', SYS_DATE_SCHEDULED)
              }
              DATE_EXISTS = true
            }

            // The date object is address-reference, so that if not
            // assigned with "new Date", all the usage date is the final
            // one
            usage['SYS_DATE_SCHEDULED'] = new Date(SYS_DATE_SCHEDULED)
            SYS_DATE_SCHEDULED.setDate(SYS_DATE_SCHEDULED.getDate() +
                                       (usage['SYS_DURATION']?usage['SYS_DURATION']:0))
            if (index == 0){
              usage['SYS_DATE_ARRIVED'] = usage['SYS_DATE_SCHEDULED']
            }
            //console.log("Next date: ", SYS_DATE_SCHEDULED)// }}}


            // Get the material collection from the SYS_SOURCE
            this.entityService.retrieveById(usage['SYS_SOURCE'])
            .subscribe(material => {
              //console.log("merge from entity:", material)


              // Get attributes of the material then assign them to the
              // material object. Note that it's recommended to merge entities
              // by this way, instead of the object deep copy for the reason
              // of attributes undefined in frontend
              this.entityService.retrieveAttribute(material.id)
              .subscribe(attributes => {

                // subMaterial is the material object under the corresponding
                // collection
                let subMaterial = {}
                attributes.forEach(attribute => {
                  subMaterial[attribute.SYS_CODE] = material[attribute.SYS_CODE]

                })

                // Get default label from the source entity
                subMaterial['SYS_LABEL'] = object['SYS_LABEL']
                subMaterial[subMaterial['SYS_LABEL']] = object[object['SYS_LABEL']]

                if (material['SYS_ENTITY_TYPE'] == 'class'){ // Routing
                  subMaterial['SYS_GENRE'] = data['SYS_GENRE']
                  subMaterial['SYS_ENTITY_TYPE'] = 'collection'
                  this.attributeList.forEach(attribute => {
                    subMaterial[attribute['SYS_CODE']] = object[attribute['SYS_CODE']]
                  })
                } else {
                  subMaterial['SYS_GENRE'] = material['SYS_GENRE']
                  subMaterial['SYS_ENTITY_TYPE'] = 'object'
                }
                // Customize attributes for new entity. It's not necessary to
                // save workcenter incidentally coz there's already a link
                // between the SYS_TARGET and the workcenter
                subMaterial['SYS_IDENTIFIER'] = material.SYS_IDENTIFIER + "/" +
                  TMP_CODE
                subMaterial['SYS_TARGET'] = data.id

                // Assign new values to the new material object
                Object.keys(usage).forEach(usageKey => {
                  subMaterial[usageKey] = usage[usageKey]
                })

                callback(subMaterial)

              })

            })
          }

        })

      })
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

    getGenreList(){
      // Get all sibling genres only if the specific entity is collection
      if (this.config.entity.SYS_ENTITY_TYPE == 'collection'){
        // Get the genre identifier for the current entity
        let genreIdentifier = this.config.entity.SYS_GENRE_IDENTIFIER
        // Get genres start with the given identifier
        this.genreService.retrieveByIdentifierPrefix(genreIdentifier)
        .subscribe(data => {
          this.genreList = data
        })
      } else {
        // Get the exclusive genre for other type of entity
        this.entityService.retrieveGenre(this.config.entity.id)
        .subscribe(data => {
          this.genreList = data
        }
                  )

      }
    }

    getAttributesByGenreId(genreId: string){
      this.genreId = genreId
      //let genreId = genre.id
      //this.attributeService.retrieveByGenreId(genreId)
      this.genreService.retrieveAttribute(genreId)
      .subscribe(
        data => {
          //console.log(data)
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
                //console.log("pass attribute type", attribute.SYS_TYPE)
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
      this.getEntity()
    }

    getEntity(){
      this.entityService.retrieveEntity(this.config.entity.id, this.object.SYS_ENTITY_TYPE)
      .subscribe(data => {
        this.entityList = data.sort(
          (a,b) => {
            if (a.updatedAt < b.updatedAt) {
              return 1
            } else {
              return -1
            }
          }
        )
      })
    }

    deleteEntityById(entityId: string){
      this.entityService.deleteById(entityId)
      .subscribe(
        data => {
          console.log('Delete Entity:', data)
          this.getEntity()
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

    getGenericWorkcenterList(){
      this.entityService.retrieveBy({
        "SYS_IDENTIFIER":"/PRODUCT_WORKCENTER"
      })
      .subscribe(data => {
        let productWorkcenter = data[0]
        this.entityService.retrieveEntity(productWorkcenter.id, "class")
        .subscribe(data => {
          this.genericWorkcenterList = data

          // Get the default attribute from project management workcenter
          this.entityService.retrieveBy({
            "SYS_IDENTIFIER":"/PROJECT_MANAGEMENT"
          })
          .subscribe(data => {
            let projectWorkcenter = data[0]
            this.entityService.retrieveEntity(projectWorkcenter.id, "class")
            .subscribe(data => {
              this.genericWorkcenterList = this.genericWorkcenterList.concat(data)
            })
          })

        })
      })
    }

    getGenericGenreList(workcenterId: string){

      // fix undefined focus error
      this.genericGenreList = []
      this.genericAttributeList = []
      this.genericGenre = {}
      this.genericAttribute = {}

      this.genreService.retrieveByEntityId(workcenterId)
      .subscribe(data => {
        this.genericGenreList = data
      })
    }

    getGenericAttributeList(genreId: string){
      this.attributeService.retrieveByGenreId(genreId)
      .subscribe(data => {
        this.genericAttributeList = data
      })
    }

    addGenericAttribute(attribute: any){
      if (!this.object['SYS_AUXILIARY_ATTRIBUTE_LIST']){
        this.object['SYS_AUXILIARY_ATTRIBUTE_LIST'] = []
      }
      this.object['SYS_AUXILIARY_ATTRIBUTE_LIST'].push(attribute.id)
    }

    removeGenericAttribute(index: string){
      this.object['SYS_AUXILIARY_ATTRIBUTE_LIST'].splice(index, 1)
    }

}
