import {Component} from '@angular/core'
import {ActivatedRoute, Router} from '@angular/router'

import {EntityService} from './service'
import {AttributeService} from '../attribute/service'

@Component({
  selector: 'view',
  templateUrl: './view.component.html',
})
export class ViewComponent{
  entity: any = {}

  object: any = {}
  objectList: any[] = []
  objectId: string = ''
  objectKeys: any[] = []
  sub: any = {}
  genreDropdown: string = ""

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entityService: EntityService,
    private attributeService: AttributeService,
  ){
    this.objectId = this.route.snapshot.params['id']
  }

  ngOnInit(){
    this.sub = this.route.params.subscribe(
      params => {
        this.objectId = params['id']
        this.getObject()
        this.genreDropdown = ""
      }
    )
  }

  ngOnDestroy(){
    this.sub.unsubscribe()
  }

  getObject(){
    this.entityService.retrieveById(this.objectId)
    .subscribe(
      data => {
        this.entity = data
        this.entityService.retrieveByGenre(this.entity.SYS_IDENTIFIER)
        .subscribe(
          data => {
            this.entity["classes"] = data
          }
        )
      })
  }

  getObject_depr(){
    this.objectKeys = [] // used for object only
    let subCategory: string
    this.entityService.retrieveById(this.objectId)
    .subscribe(
      data => {
        this.object = data
        this.objectKeys = Object.keys(this.object)
        //console.log(this.objectKeys)
        switch (this.object.genre) {
          case "domain":
            subCategory = "class"
          break
          case "class":
            subCategory = "collection"
          break
          case "collection":
            subCategory = "object"
          break
          default:
            subCategory = ""
          break
        }
        //console.log(subCategory)
        this.object["subgenres"] = {}
        for (let g of this.object["genres"]) {
          //console.log(g)
          this.entityService.retrieveSubEntity(g.identifier, subCategory)
          .subscribe(
            data => {
              //console.log(">>> retrieve entities of identifier"+g.identitfier+":")
              //console.log(data)
              //this.object["subgenres"][g.code] = data
              this.object["subgenres"][g.identifier] = data
            }
          )
        }

        // get children
        this.object["subEntities"] = {}
        this.object["subEntitiesKeys"] = []
        let entityHierarchy = this.object.identifier.split("/")
        console.log(entityHierarchy)
        let classEntityIdentifier = "/" + entityHierarchy[1] + "/" + entityHierarchy[2]
        console.log("classEntityIdentifier: " + classEntityIdentifier)
        let collectionEntityIdentifier = "/" + entityHierarchy[1] + "/" + entityHierarchy[2] + "/" + entityHierarchy[3]

        // get the class entity of the current object
        //this.entityService.retrieveByIdentifier(classEntityIdentifier)
        this.entityService.retrieveByIdentifier(collectionEntityIdentifier)
        .subscribe(
          data => {

            for (let d of data){
              // get parent entities
              this.attributeService.retrieveByTypeEntity("parent", d.id)
              .subscribe(
                data => {
                  console.log(data)
                  for (let d of data){
                    if (this.object["subEntitiesKeys"].indexOf(d["code"]) < 0){
                      console.log(d)
                      this.object["subEntitiesKeys"].push(d["code"])
                      // get "reagent.id=xxxx"
                      this.entityService.retrieveByEntity(d["code"] + ".id", this.object.id)
                      .subscribe(
                        data => {
                          this.object["subEntities"][d["code"]] = data
                        }
                      )
                    }
                  }

                }
              )

              // get parent entities

              // get attributes refs to the class entity
              this.attributeService.retrieveByTypeEntity("entity", d.id)
              .subscribe(
                data => {
                  console.log(data) // two attributes with the same code
                  for (let d of data){
                    if (this.object["subEntitiesKeys"].indexOf(d["code"]) < 0){
                      this.object["subEntitiesKeys"].push(d["code"]) // add keys twice
                      // get "reagent.id=xxxx"
                      this.entityService.retrieveByEntity(d["code"], this.object.id)
                      .subscribe(
                        data => {
                          this.object["subEntities"][d["code"]] = data
                        }
                      )
                    }
                  }

                }
              )

            }
          }
        )


      }
    )
  }

}
