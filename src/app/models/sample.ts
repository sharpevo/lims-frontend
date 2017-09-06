import {Injectable} from '@angular/core'
import {EntityService} from '../entity/service'

import { Observable } from 'rxjs/Rx'
import {GenreService} from '../genre/service'

@Injectable()
export class SampleService{

  constructor(
    private genreService: GenreService,
    private entityService: EntityService
  ){}

  buildSampleInlineList(sampleList: any[]): any[]{
    let resultList: any = {}

    for (let i = 0; i < sampleList.length; i++){
      let capCode = sampleList[i]['SYS_CAPTURE_CODE']
      let laneCode = sampleList[i]['SYS_LANE_CODE']
      let runCode = sampleList[i]['SYS_RUN_CODE']
      let sampleCode = 'SAMPLES'
      if (runCode) {
        if (!resultList[runCode]){
          resultList[runCode] = {}
        }
        if (!resultList[runCode][laneCode]){
          resultList[runCode][laneCode] = {}
        }
        if (!resultList[runCode][laneCode][capCode]){
          resultList[runCode][laneCode][capCode] = {}
          resultList[runCode][laneCode][capCode][sampleCode] = []
        }
        resultList[runCode][laneCode][capCode][sampleCode].push(sampleList[i])
      } else if (laneCode){
        if (!resultList[laneCode]){
          resultList[laneCode] = {}
        }
        if (!resultList[laneCode][capCode]){
          resultList[laneCode][capCode] = {}
          resultList[laneCode][capCode][sampleCode] = []
        }
        resultList[laneCode][capCode][sampleCode].push(sampleList[i])
      } else if (capCode) {
        // treat general samples as the 'undefined' caps
        if (!resultList[capCode]){
          resultList[capCode] = {}
          resultList[capCode][sampleCode] = []
        }
        // expression changed error occured w/o the following initialization
        // in the sample.inline.component
        sampleList[i]['TMP_CHECKED'] = false
        resultList[capCode][sampleCode].push(sampleList[i])
      } else {
        if (!resultList[sampleCode]) {
          resultList[sampleCode] = []
        }
        resultList[sampleCode].push(sampleList[i])
      }

    }
    return resultList
  }

  getPreviousChainedSample(sample: any, callback){
    this.entityService.retrieveBy({
      'SYS_TARGET': sample['SYS_TARGET'],
      'sort': 'SYS_ORDER',
    }).subscribe(data => {

      // get previous sample
      let index = -1
      let previousSample = {}

      for (let i=0; i < data.length; i ++){
        if (data[i].id == sample.id){
          index = i
          break
        }
      }

      if (index < 0) {
        return
      }
      if (index == 0){
        previousSample = sample
      }

      if (index >= 1){
        previousSample = data[index-1]
      }

      previousSample['TMP_NEXT_SAMPLE_ID'] = sample.id
      callback(previousSample)
    })
  }

  parsePreviousSample(sample: any, data: any[]): any{
    // get previous sample
    let index = -1
    let previousSample = {}

    for (let i=0; i < data.length; i ++){
      if (data[i].id == sample.id){
        index = i
        break
      }
    }

    if (index < 0) {
      return
    }
    if (index == 0){
      previousSample = sample
    }

    if (index >= 1){
      previousSample = data[index-1]
    }

    previousSample['TMP_NEXT_SAMPLE_ID'] = sample.id
    return previousSample
  }

  terminateSample(sample: any): any{
    sample['SYS_DATE_TERMINATED'] = new Date()
    return this.entityService.update(sample)
  }

  //terminateSamples(leadingSample: any): any[]{

  //let terminateObs = []
  //this.entityService.retrieveBy(
  //{'SYS_SAMPLE_CODE': leadingSample['SYS_SAMPLE_CODE']})
  //.subscribe(samples => {
  //samples.forEach(sample => {
  //console.log("-->", sample.id)
  //sample['SYS_DATE_TERMINATED'] = new Date()
  //terminateObs.push(
  //this.entityService.update(sample))
  //})
  //})
  //return terminateObs
  //}

  retrieveRootTarget(sampleId: string): string{
    this.entityService.retrieveBy({id: sampleId})
    .subscribe(data => {
      console.log("Analyze target:", data)
      if (data['SYS_TARGET']){
        this.retrieveRootTarget(data['SYS_TARGET']['id'])
      } else {
        return data['SYS_TARGET']
      }
    })

    return ''
  }

  getHybridInfo(sample: any): any{

    let runString = 'SYS_RUN_CODE'
    let lanString = 'SYS_LANE_CODE'
    let capString = 'SYS_CAPTURE_CODE'
    let runCode = sample[runString]
    let lanCode = sample[lanString]
    let capCode = sample[capString]

    if (runCode){
      return {
        "type":"RUN",
        [runString]: runCode
      }
    }
    if (lanCode){
      return {
        "type":"LANE",
        [lanString]: lanCode
      }
    }
    if (capCode){
      return {
        "type":"CAPTURE",
        [capString]: capCode
      }
    }
  }

  //
  // submition
  //

  submitObject(workcenter: any, sampleList: any[], issueSample: boolean, object:any, parentMap: any){

    this.entityService.retrieveGenre(workcenter.id)
    .subscribe(data => {
      // Take the first genre as default
      this.genreService.retrieveAttribute(data[0].id)
      .subscribe(data => {
        //data.forEach(attribute => {
        //switch (attribute.SYS_TYPE){
        //case "entity":
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
        //console.log(">-", attribute.SYS_CODE)
        //if (!attribute.SYS_TYPE_ENTITY_REF) {
        //parentMap[attribute.SYS_CODE] = {}
        //}
        //break
        //default:
        //}

        //})
        let attributeList = data.sort((a,b) => {
          if (a.SYS_ORDER > b.SYS_ORDER) {
            return 1
          } else {
            return -1
          }
        })
        let attributeInfo = {
          "attributeList": attributeList,
          "parentMap": parentMap
        }
        console.log("aaa", attributeInfo)

        if (issueSample){
          console.log("issueSample")
          this.issueSample(sampleList, object, workcenter, attributeInfo)
          return
        }
        console.log("submitObject")
        // samples from the previous workcenter or the current one in the first
        // workcenter with workcenter-specific attributes:
        // - for the attributes defined by administrator, if they are same, use
        //   the previous one
        // - for the attributes starts with SYS, use current workcenter
        sampleList.forEach(sample => {
          console.log('processing candidate sample', sample)
          //this.entityService.retrieveById(sample['TMP_NEXT_SAMPLE_ID'])
          this.entityService.retrieveById(sample.id)
          .subscribe(data => {
            console.log("processing sample:", data)
            this.submitSample(workcenter, object, data, attributeInfo)
          })
        })
      })
    })

  }

  issueSample(sampleList: any[], object: any, entity: any, attributeInfo: any){
    sampleList.forEach(sample => {
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
      Object.keys(object).forEach(key => {
        sample[key] = object[key]
      })

      sample['SYS_LABEL'] = 'SYS_SAMPLE_CODE'
      sample['SYS_ENTITY_TYPE'] = 'collection'
      sample['SYS_IDENTIFIER'] = entity['SYS_IDENTIFIER'] +
        '/' +
        sample['SYS_SAMPLE_CODE'] + '.' + object.TMP_CODE

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
                this.createObject(sample, attributeInfo, true)
              })
            })


      } else {
        this.createObject(sample, attributeInfo, true)
      }
    })
  }


  submitSample(entity: any, object: any, selectedSample: any, attributeInfo: any){

    this.entityService.retrieveBy({
      'SYS_TARGET': selectedSample['SYS_TARGET'],
      'sort': 'SYS_ORDER',
    }).subscribe(data => {
      let sample = {}
      let previousSample = this.parsePreviousSample(selectedSample, data)
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
        Object.keys(object).forEach(key => {
          sample[key] = object[key]
        })

        // Add customized sample attribute
        sample['SYS_IDENTIFIER'] = entity['SYS_IDENTIFIER'] + '/' +
          selectedSample['SYS_CODE']

        // Add default label, including SYS_SAMPLE_CODE
        sample['SYS_LABEL'] = selectedSample['SYS_LABEL']
        sample[sample['SYS_LABEL']] = selectedSample[selectedSample['SYS_LABEL']]

        sample['SYS_DATE_COMPLETED'] = new Date()
        sample['SYS_ENTITY_TYPE'] = 'collection'
        this.createObject(sample, attributeInfo, false)
      })
    })

  }


  createObject(object: any, attributeInfo: any, issueSample: boolean){

    if (issueSample){
      this.entityService.create(object)
      .subscribe(data =>{
        this.makeConn(data, attributeInfo)
        console.log('Issue sample:', data)
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
          this.makeConn(data, attributeInfo)
          console.log('Add Entity:', data)
        },
        err => {
          console.error(err)
        })
      })
    }
  }


  makeConn(sourceObject: any, attributeInfo: any){

    let attributeList = attributeInfo['attributeList']
    let parentObjects = attributeInfo['parentMap']
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

          // Calculate SYS_DATE_SCHEDULED
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
          //console.log("Next date: ", SYS_DATE_SCHEDULED)

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
                attributeList.forEach(attribute => {
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

  // Get parentMap and attributeList
  getAttributesByGenreId(genreId: string, callback): any{
    this.genreService.retrieveAttribute(genreId)
    .subscribe(data => {
      let parentMap = {}
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
            parentMap[attribute.SYS_CODE] = {}
          }
          break
          default:
        }

      })
      let attributeList = data.sort((a,b) => {
        if (a.SYS_ORDER > b.SYS_ORDER) {
          return 1
        } else {
          return -1
        }
      })
      return {
        "attributeList": attributeList,
        "parentMap": parentMap
      }
    })
  }

}
