import {Component} from '@angular/core'
import {DatePipe} from '@angular/common'
import {MdDialog, MdDialogRef} from '@angular/material';
import {MdSnackBar} from '@angular/material'

import {AttributeService} from '../attribute/service'
import {GenreService} from '../genre/service'
import {EntityService} from '../entity/service'
import {SampleService} from '../models/sample'

//import {Observable} from 'rxjs/Observable'
import { Observable } from 'rxjs/Rx'

@Component({
  selector: 'sample-form-dialog',
  templateUrl: './form.dialog.component.html',
})
export class SampleFormDialog {
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

  excelResult: any[] = []

  constructor(
    private snackBar: MdSnackBar,
    private genreService: GenreService,
    private entityService: EntityService,
    private attributeService: AttributeService,
    private sampleService: SampleService,
    public dialogRef: MdDialogRef<SampleFormDialog>) {}

    ngOnInit(){
      this.getGenreList()
      this.generateEntityCode()
      this.generateEntityType()
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

    issueSample(){
      this.config.sampleList.forEach(sample => {
        if (!sample['SYS_SAMPLE_CODE']){
          console.log("invalid sample code")
        }

        // Copy attributes from object to sample
        // the object does not provide an id since the attributes are input in page
        // Keys are including
        // Assign key: TMP_CODE
        // Assign key: SYS_ENTITY_TYPE
        // Assign key: SYS_GENRE
        // Assign key: SYS_LABEL
        Object.keys(this.object).forEach(key => {
          sample[key] = this.object[key]
        })

        sample['SYS_LABEL'] = 'SYS_SAMPLE_CODE'
        sample['SYS_ENTITY_TYPE'] = 'collection'
        sample['SYS_IDENTIFIER'] = this.config.entity['SYS_IDENTIFIER'] +
          '/' +
          sample['SYS_SAMPLE_CODE'] + '.' + this.object.TMP_CODE

        // retain the date for the sample
        let originalSampleSchuduledDate = sample['SYS_DATE_SCHEDULED']

        // process samples already in the LIMS
        // delete id before creation if the sample is inside of LIMS
        if (sample.id){

          // terminate other uncompleted samples in the system

          let terminateObs = []
          this.entityService.retrieveBy(
            {'SYS_SAMPLE_CODE': sample['SYS_SAMPLE_CODE'],
              'sort': 'SYS_DATE_SCHEDULED'})
              .subscribe(samples => {
                samples.forEach(sampleItem => {
                  // only process samples after the current sample
                  // including other pathway

                  let sampleDate = new Date(sampleItem['SYS_DATE_SCHEDULED'])
                  let refSampleDate = new Date(originalSampleSchuduledDate)
                  //console.log("==", sampleItem['SYS_DATE_SCHEDULED'], sample['SYS_DATE_SCHEDULED'])
                  if (sampleDate >= refSampleDate){
                    console.log( sampleDate, ">", refSampleDate)
                    //console.log("-->", sampleItem.id)
                    sampleItem['SYS_DATE_TERMINATED'] = new Date()
                    terminateObs.push(
                      this.entityService.update(sampleItem))
                  }
                })

                console.log(">>", terminateObs)
                Observable
                .forkJoin(terminateObs)
                .subscribe((data: any[][]) => {
                  console.log("---->", data)
                  delete sample.id
                  delete sample._id
                  delete sample.SYS_TARGET
                  // create object after terminating samples
                  this.createObject(sample)
                })
              })


        } else {
          this.createObject(sample)
        }
      })
    }

    submitObject(){
      if (this.config.issueSample){
        console.log("issueSample")
        this.issueSample()
        return
      }
      console.log("submitObject")
      // samples from the previous workcenter or the current one in the first
      // workcenter with workcenter-specific attributes:
      // - for the attributes defined by administrator, if they are same, use
      //   the previous one
      // - for the attributes starts with SYS, use current workcenter
      this.config.sampleList.forEach(sample => {
        console.log('processing candidate sample', sample)
        //this.entityService.retrieveById(sample['TMP_NEXT_SAMPLE_ID'])
        this.entityService.retrieveById(sample.id)
        .subscribe(data => {
          console.log("processing sample:", data)
          this.submitSample(data)
        })
      })
    }

    submitSample(selectedSample: any){

      this.entityService.retrieveBy({
        'SYS_TARGET': selectedSample['SYS_TARGET'],
        'sort': 'SYS_ORDER',
      }).subscribe(data => {

        let sample = {}
        let previousSample = this.sampleService.parsePreviousSample(selectedSample, data)
        this.entityService.retrieveAttribute(previousSample.id)
        .subscribe(data => {
          //data.forEach(attribute => {
          //sample[attribute['SYS_CODE']] = previousSample[attribute['SYS_CODE']]
          //})

          // Copy capture/lane/run code manually
          let captureCode = 'SYS_CAPTURE_CODE'
          let laneCode = 'SYS_LANE_CODE'
          let runCode = 'SYS_RUN_CODE'
          if (previousSample[captureCode]) {
            sample[captureCode] = previousSample[captureCode]
          }
          if (previousSample[laneCode]) {
            sample[laneCode] = previousSample[laneCode]
          }
          if (previousSample[runCode]) {
            sample[runCode] = previousSample[runCode]
          }

          // Copy attributes from object to sample
          Object.keys(this.object).forEach(key => {
            sample[key] = this.object[key]
          })

          // Add customized sample attribute
          sample['SYS_IDENTIFIER'] = this.config.entity['SYS_IDENTIFIER'] +
            '/' +
            selectedSample['SYS_CODE']

          // Add default label, including SYS_SAMPLE_CODE
          sample['SYS_LABEL'] = selectedSample['SYS_LABEL']
          sample[sample['SYS_LABEL']] = selectedSample[selectedSample['SYS_LABEL']]

          sample['SYS_DATE_COMPLETED'] = new Date()
          sample['SYS_ENTITY_TYPE'] = 'collection'
          this.createObject(sample)
        })
      })

    }

    createObject(object: any){

      //console.log(object)
      //console.log(this.parentMap)

      if (this.config.issueSample){
        this.entityService.create(object)
        .subscribe(data =>{
          this.makeConn(data, this.parentMap)
          console.log('Issue sample:', data)
          this.showMessage("Added")
        })
      } else {
        this.entityService.retrieveByIdentifierFull(object['SYS_IDENTIFIER'])
        .subscribe(data => {
          //console.log("retrive chained sample:", data)
          object.id = data[0].id
          object['SYS_DATE_SCHEDULED'] = data[0]['SYS_DATE_SCHEDULED']
          // Using update instead of create since the identifier /workcenter/17R001
          // has been assigned to the scheduled sample
          this.entityService.update(object)
          .subscribe(data => {

            this.makeConn(data, this.parentMap)
            console.log('Add Entity:', data)
            this.showMessage("Added")

          },
          err => {
            console.error(err)
          })
        })
      }
    }

    makeConn(sourceObject: any, parentObjects: any){

      // Get the keys for each kind of BoM/Routing
      // e.g. "bom", "bill_of_material"
      Object.keys(parentObjects).forEach(key => {
        //console.log("processing key:", key)

        let SYS_DATE_SCHEDULED = new Date()
        let DATE_EXISTS = false

        // Get the bom object id, which is used as the key of the actual
        // usage, e.g., <bom object id>
        Object.keys(parentObjects[key]).forEach((entityId, index) =>{
          //console.log("processing id:", entityId)

          // `usage` is the inputs from user and contains SYS_QUANT,
          // SYS_SOURCE, etc.
          let usage = parentObjects[key][entityId]
          //console.log("processing usage:", usage)

          // only process checked Material or Workcenter
          if (usage['SYS_CHECKED']){
            //console.log('process checked entry:', usage)

            // Calculate SYS_DATE_SCHEDULED// {{{
            //
            if (!DATE_EXISTS){
              if (sourceObject['SYS_DATE_SCHEDULED']){
                SYS_DATE_SCHEDULED = new Date(sourceObject['SYS_DATE_SCHEDULED'])
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
                subMaterial['SYS_LABEL'] = sourceObject['SYS_LABEL']
                subMaterial[subMaterial['SYS_LABEL']] = sourceObject[sourceObject['SYS_LABEL']]

                if (material['SYS_ENTITY_TYPE'] == 'class'){ // Routing
                  subMaterial['SYS_GENRE'] = sourceObject['SYS_GENRE']
                  subMaterial['SYS_ENTITY_TYPE'] = 'collection'
                  this.attributeList.forEach(attribute => {
                    subMaterial[attribute['SYS_CODE']] = sourceObject[attribute['SYS_CODE']]
                  })
                } else {
                  subMaterial['SYS_GENRE'] = material['SYS_GENRE']
                  subMaterial['SYS_ENTITY_TYPE'] = 'object'
                }
                // Customize attributes for new entity. It's not necessary to
                // save workcenter incidentally coz there's already a link
                // between the SYS_TARGET and the workcenter
                subMaterial['SYS_IDENTIFIER'] = material.SYS_IDENTIFIER + "/" +
                  sourceObject['SYS_CODE']
                subMaterial['SYS_TARGET'] = sourceObject.id

                // Assign new values to the new material object
                Object.keys(usage).forEach(usageKey => {
                  subMaterial[usageKey] = usage[usageKey]
                })

                this.entityService.create(subMaterial)
                .subscribe(data =>{
                  console.log("merged entity:", data)
                })
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
          this.object.SYS_GENRE = this.genreList[0].id
          this.getAttributesByGenreId(this.object.SYS_GENRE)
        })

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

    submitExcel(event){
      let file = event.srcElement.files;
      let postData = {field1:"field1", field2:"field2"}; // Put your form data variable. This is only example.
      console.log(file)
      this.entityService.postFile(file)
      .subscribe(data => {
        this.excelResult = data[0]
      })

      //this._service.postWithFile(this.baseUrl + "add-update",postData,file).then(result => {
      //console.log(result);
      //});
    }


}
