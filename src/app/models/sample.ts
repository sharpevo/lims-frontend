import {Injectable} from '@angular/core'
import {EntityService} from '../entity/service'

import { Observable } from 'rxjs/Rx'
import {GenreService} from '../genre/service'
import {UtilService} from '../util/service'

import {MdSnackBar} from '@angular/material'
import {SpinnerService} from '../util/spinner.service'
import {UserService} from '../util/user.service'

import {Router} from '@angular/router'

@Injectable()
export class SampleService{

  userInfo: any = {}

  ignoredAttribute: any = {
    "SYS_WORKCENTER_OPREATOR":true,
    "SYS_DATE_COMPLETED":true,
    "SYS_DATE_SCHEDULED":true,
  }

  constructor(
    public snackBar: MdSnackBar,
    public spinner: SpinnerService,
    private genreService: GenreService,
    private utilService: UtilService,
    private userService: UserService,
    private router: Router,
    private entityService: EntityService
  ){
    this.userInfo = this.userService.getUserInfo()
  }

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

  /**
   * Get all the attributes of the given sample and SYS_CODE, including history
   * values.
   *
   * @param sample the target sample to get attributes
   * @param attributeCode the SYS_CODE of the auxiliary attribute
   * @param callback assignment usually
   *
   */
  getAuxiliaryAttributeList(sample: any, attributeCode: string, attributeGenre: string, callback){

    // Get the latest sample
    this.entityService.retrieveBy({
      "SYS_SAMPLE_CODE": sample['SYS_SAMPLE_CODE']
    })
    .subscribe(_sampleList => {

      let sampleList = _sampleList
      .sort((a,b) => {
        //if (a['updatedAt'] < b['updatedAt']){
        if (a['SYS_DATE_COMPLETED'] < b['SYS_DATE_COMPLETED']){
          return 1
        } else {
          return -1
        }
      })
      let attributeObjectList = []

      let activatedSampleList = sampleList
      .filter(sample => sample['SYS_DATE_COMPLETED'])// &&
      //!sample['SYS_DATE_TERMINATED'])
      if (activatedSampleList.length > 0){
        let uniqueSampleList = []
        let seen = {}
        activatedSampleList.forEach(sample => {
          let key = attributeCode + "|" + sample[attributeCode]
          if (!seen[key]) {
            if (sample[attributeCode]){
              seen[key] = true
            }

            if (attributeGenre == sample['SYS_GENRE'] || attributeCode == "SYS_SAMPLE_CODE") {
              uniqueSampleList.push(sample)
            }
          }
        })

        uniqueSampleList
        .forEach(sample => {
          attributeObjectList.push({
            "id": sample.id,
            "dateCompleted": sample['SYS_DATE_COMPLETED'],
            "dateUpdated": sample['updatedAt'],
            "value": sample[attributeCode]?sample[attributeCode]:"---"
          })
        })
      } else {
        // For samples that are just submitted, none of which satisfied the
        // date condition, so push the attributes of the first sample.
        let firstSample = sampleList[0]
        attributeObjectList.push({
          "id": firstSample.id,
          "dateCompleted": firstSample['SYS_DATE_COMPLETED'],
          "dateUpdated": firstSample['updatedAt'],
          "value": firstSample[attributeCode]?firstSample[attributeCode]:"---"
        })
      }

      callback(attributeObjectList)
    })
  }

  /**
   * Get the latest attributes of the given sample
   *
   */
  getLatestAttributes(sample: any){

    // Get the latest sample
    this.entityService.retrieveBy({
      "SYS_SAMPLE_CODE": sample['SYS_SAMPLE_CODE']
    })
    .subscribe(sampleList => {
      let latestSampleList = []
      sampleList.forEach(sample => {
        if (sample['SYS_DATE_COMPLETED'] && sample['SYS_DATE_TERMINATED']){
          latestSampleList.push(sample)
        }
      })

      // Get all the results sorted by date
      let latestAttributeMap = {}
      latestSampleList.sort((a,b) => {
        if (a['SYS_DATE_COMPLETED'] > b['SYS_DATE_COMPLETED']){
          return 1
        } else {
          return -1
        }
      }).forEach(sample => {
        Object.keys(sample['SYS_SCHEMA']).forEach(schema => {
          if (!latestAttributeMap[schema]){
            latestAttributeMap[schema] = []
          }
          // Build result structure
          latestAttributeMap[schema].push({
            "ID": sample.id,
            "DATE": sample['SYS_COMPLETED_DATE'],
            "VALUE": sample[schema['SYS_CODE']],
          })
        })
      })
      return latestAttributeMap
    })
  }

  /**
   * Get all the droplets of the given sample
   *
   * @param sample sample of which droplets belongs to
   */
  getDropletList(sample: any): any{
    this.entityService.retrieveBy({
      "SYS_SAMPLE_CODE": sample['SYS_SAMPLE_CODE']
    })
    .subscribe(sampleList => {
      let latestSampleList = []
      sampleList.forEach(sample => {
        if (sample['SYS_DATE_COMPLETED'] && sample['SYS_DATE_TERMINATED']){
          latestSampleList.push(sample)
        }
      })
      return latestSampleList
    })
  }

  /**
   * Build samples in backend-friendly hybrid structure.
   *
   * With the help of the backend, each of the sample will be returned with an attribute "SYS_HYBRID_INFO" which is formed like,
   *
   * SYS_HYBRID_INFO: {
   *    HYBRID_CODE: "SYS_CAPTURE_CODE"
   *    SYS_CAPTURE_CODE:"cap-aa"
   *    type:"CAPTURE"
   * }
   *
   * @param sampleList samples to build
   *
   */
  buildHybridSampleList(sampleList: any, hybridAttributeMap: any): any{
    let hybridObjectMap = {}
    sampleList.forEach(sample => {
      console.log(sample)
      if(!hybridObjectMap[sample.id]) {
        hybridObjectMap[sample.id] = {}
      }
      if (!hybridObjectMap[sample.id]['attributeObject']) {
        hybridObjectMap[sample.id]['attributeObject'] = {}
      }
      hybridObjectMap[sample.id]['attributeObject'] = hybridAttributeMap[sample['SYS_SAMPLE_CODE']]
      if (!hybridObjectMap[sample.id]['sampleIdList']) {
        hybridObjectMap[sample.id]['sampleIdList'] = []
      }
      hybridObjectMap[sample.id]['sampleIdList'].push(sample.id)
    })
    return hybridObjectMap
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


  /**
   * Submit samples in the form for both of issueSample of Project Manager and
   * submitSample of Product Operator, and issueSample and submitSample will
   * call createObject latter.
   *
   * @param workcenter Current workcenter, or "General Project" for issueSample
   * @param sampleList Selected samples, the sample list should belongs to the
   * current workcenter rather the previous one.
   * @param issueSample Boolean tag to indicate whether it's called from
   * Project Manager or not.
   * @param object Object manipulated in the form of web page.
   * @param parentMap BoM/Routing object.
   *
   */
  submitObject(workcenter: any, sampleList: any[], issueSample: boolean, object:any, parentMap: any){

    // Find the user in the lims by the user email.
    // For the mismatched user, they are illegal to submit any samples.
    if (!this.userInfo.limsid){
      console.log("illegal user", this.userInfo)
      this.showMessage("Invalid user: " + this.userInfo.email, "OK")
      return
    }

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
          this.issueSample(workcenter, object, sampleList, attributeInfo)
          return
        }
        console.log("submitObject")

        let msg_workcenter = workcenter[workcenter['SYS_LABEL']]
        let msg_sampleCount = sampleList.length
        let msg_sampleList = ""
        // samples from the previous workcenter or the current one in the first
        // workcenter with workcenter-specific attributes:
        // - for the attributes defined by administrator, if they are same, use
        //   the previous one
        // - for the attributes starts with SYS, use current workcenter
        sampleList.forEach(sample => {
          msg_sampleList += ">- [" + sample['SYS_SAMPLE_CODE'] + "](" + sample._id + ")\n\n"
          console.log('processing candidate sample', sample)
          //this.entityService.retrieveById(sample['TMP_NEXT_SAMPLE_ID'])
          this.entityService.retrieveById(sample.id)
          .subscribe(data => {
            console.log("processing sample:", data)
            this.submitSample(workcenter, object, data, attributeInfo)
          })
        })

        // Send notification to Dingtalk
        let date = new Date()
        let msg_date = date.getFullYear() + '-' +
          (date.getMonth() + 1) + '-' +
          date.getDate() + ' ' +
          date.getHours() + ':' +
          date.getMinutes()

        this.utilService.sendNotif(
          "actionCard",
          `${msg_workcenter}\n\n> Submit ${msg_sampleCount} samples\n\n${msg_sampleList}\n\n> \n\n> ${this.userInfo.name}\n\n>${msg_date}`,
          "/workcenter-dashboard/" + workcenter.id
        )
        .subscribe(() => {
          console.log("Sending notification:", data)
        })
      })

    })


  }

  /**
   * issueSample will build samples for the General Project workcenter,
   * manipulated by product manager
   *
   * @param entity workcenter
   * @param object ngModel in the form
   * @param sampleList selected samples
   * @param attributeInfo argument map
   *
   */

  issueSample(entity: any, object: any, sampleList: any[], attributeInfo: any){
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

      // process samples already in the LIMS delete id before creation if the
      // sample is inside of LIMS
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
                if (sampleDate >= refSampleDate ||
                    sampleItem['SYS_GENRE_IDENTIFIER'] == '/PROJECT_MANAGEMENT/GENERAL_PROJECT/'){

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

  /**
   * submitSample will build samples for the specific workcenter, manipulated
   * by operators
   *
   * @param entity workcenter
   * @param object ngModel in the form
   * @param selectedSample seleted samples
   * @param attributeInfo argument map
   *
   */
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

    object['SYS_WORKCENTER_OPERATOR'] = this.userInfo.limsid

    if (issueSample){
      this.entityService.create(object)
      .subscribe(data =>{
        delete data.SYS_WORKCENTER_OPERATOR
        this.buildRelationship(data, attributeInfo)
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
          this.buildRelationship(data, attributeInfo)
          console.log('Add Entity:', data)
        },
        err => {
          console.error(err)
        })
      })
    }
  }

  /**
   * buildRelationship is designed for planning in routing or records usage of
   * material in BoM, from sourceEntity to the targetEntity.
   *
   * @param sourceEntity The manipulated entity.
   * @param attributeInfo argument map
   *
   */
  buildRelationship(sourceEntity: any, attributeInfo: any){
    this.spinner.start()

    let observableList = []

    let attributeList = attributeInfo['attributeList']
    let parentMap = attributeInfo['parentMap']

    // Get the keys for each kind of BoM/Routing, e.g., "bom", "bill_of_material".
    Object.keys(parentMap).forEach(key => {

      let targetEntityMap = parentMap[key]

      let SYS_DATE_SCHEDULED = new Date()
      let DATE_EXISTS = false

      // Get the bom object id, which is used as the key of the actual usage, e.g., <bom object id>
      Object.keys(targetEntityMap)
      .sort((a,b) => {
        // sort target entities by SYS_ORDER which is manipulated by admins.
        if (targetEntityMap[a]['SYS_ORDER'] > targetEntityMap[b]['SYS_ORDER']){
          return 1
        } else {
          return -1
        }
      })
      .forEach((entityId, index) =>{

        // targetEntityInput is the inputs from user and contains SYS_QUANT, SYS_SOURCE, etc.
        let targetEntityInput = targetEntityMap[entityId]

        // only process checked Material or Workcenter
        if (targetEntityInput['SYS_CHECKED']){
          //console.log('process checked entry:', targetEntityInput)

          // Calculate SYS_DATE_SCHEDULED
          if (!DATE_EXISTS){
            if (sourceEntity['SYS_DATE_SCHEDULED']){
              SYS_DATE_SCHEDULED = new Date(sourceEntity['SYS_DATE_SCHEDULED'])
              //console.log('DATE not exists, but object exist', SYS_DATE_SCHEDULED)
            }
            DATE_EXISTS = true
          }

          // The date object is address-reference, so that if not assigned with
          // "new Date", all the targetEntityInput date is the final one
          targetEntityInput['SYS_DATE_SCHEDULED'] = new Date(SYS_DATE_SCHEDULED)
          SYS_DATE_SCHEDULED.setDate(
            SYS_DATE_SCHEDULED.getDate() +
              (targetEntityInput['SYS_DURATION']?targetEntityInput['SYS_DURATION']:0)
          )
          if (index == 0){
            targetEntityInput['SYS_DATE_ARRIVED'] = targetEntityInput['SYS_DATE_SCHEDULED']
          }

          // Get the target entity from the SYS_SOURCE
          observableList.push(
            this.entityService.retrieveById(targetEntityInput['SYS_SOURCE'])
            .mergeMap(targetEntity => {
              //.subscribe(targetEntity => {

              // check whether SYS_SOURCE has been specified manually
              // BoM: 'class' == 'collection'
              // Routing: 'class' == 'class', since it's only one option and the
              // checkbox is another way to detect checked or not
              if (targetEntity.SYS_ENTITY_TYPE == targetEntityInput['SYS_FLOOR_ENTITY_TYPE']) {
                // SYS_SOURCE has been specified manually

                //console.log("---------Entries has been specified:", targetEntity)
                return this.createSubEntity(sourceEntity, targetEntity, attributeList, targetEntityInput)

              } else {
                // SYS_SORUCE is not selected, and it happens only when BoM
                // (checked but not selected)

                // Get the LOTs of targetEntity and take the first one as the default
                return this.entityService.retrieveEntity(
                  targetEntityInput['SYS_SOURCE'],
                  targetEntityInput['SYS_FLOOR_ENTITY_TYPE'])
                  .mergeMap(data => {
                    //.subscribe(data => {
                    //console.log("---------Retrieve entries in BoM or Routing:", data[0])
                    //console.log("merge from entity:", targetEntity)
                    if (!data[0]) {
                      console.warn("None of LOT under the " +
                                   targetEntityInput['SYS_SOURCE'])
                    } else {
                      return this.createSubEntity(sourceEntity, data[0], attributeList, targetEntityInput)
                    }

                  })

              }
            })
          )
        }
      })

    })

    Observable.concat(...observableList).subscribe(
      data => {
        console.log("data: ", data)
      },
      err => {
        console.log("err: ", err)
      },
      () => {
        //setTimeout(() => {
        this.spinner.stop()
        this.showMessage("Completed", "OK")
        this.router.navigate(['/redirect' + this.router.url])
        //}, 3000)
      }
    )

  }

  /**
   * Create subentities for the given entity. For the BoM, it's used to create
   * the droplet(object entity) under the Material, and for the routing, to
   * create the sample(collection entity) under the Workcenter.
   *
   * For the creation of subEntity, Routing copies "attributeList" from the
   * current workcenter(Project Management) to the subEntity for the target
   * workcenter(Sample Extraction for example), e.g., index, panel, routing,
   * etc.; BoM copies "attrbiutes" from the target material to the subEntity
   * for the target Material(Kapa Hifi for example).
   *
   * @param sourceEntity The SYS_SOURCE object under the Project Management.
   * @param targetEntity Material(collection, in BoM) or Workcenter(class, in Routing).
   * @param workcenterAttributeList Attributes of the sub entity of the current workcenter.
   * @param targetEntityInput The BoM/Routing entry generated by entity/form.inline.component.
   * @return nill
   */
  createSubEntity(
    sourceEntity:any,
    targetEntity:any,
    workcenterAttributeList: any[],
    targetEntityInput: any
  ): Observable<any> {

    let subEntity = {}

    // Get default label from the source entity
    subEntity['SYS_LABEL'] = sourceEntity['SYS_LABEL']
    subEntity[subEntity['SYS_LABEL']] = sourceEntity[sourceEntity['SYS_LABEL']]

    subEntity['SYS_TARGET'] = sourceEntity.id

    // The tail timestamp is used to avoid duplicated SYS_IDENTIFIER for the
    // samples involved more than one time in the same workcenter
    subEntity['SYS_IDENTIFIER'] = targetEntity.SYS_IDENTIFIER + "/" +
      sourceEntity['SYS_CODE'] + '.' + new Date().getTime()

    if (targetEntity['SYS_ENTITY_TYPE'] == 'class'){
      // Routing specific operations

      subEntity['SYS_ENTITY_TYPE'] = 'collection'
      workcenterAttributeList.forEach(attribute => {
        if (!this.ignoredAttribute[attribute.SYS_CODE]) {
          subEntity[attribute['SYS_CODE']] = sourceEntity[attribute['SYS_CODE']]
        }
      })
      return this.submitSubEntity(subEntity, targetEntity, targetEntityInput)

    } else { // == 'collection'
      // BoM specific operations

      subEntity['SYS_ENTITY_TYPE'] = 'object'
      return this.entityService.retrieveAttribute(targetEntity.id)
      .mergeMap(attributes => {
        attributes.forEach(attribute => {
          subEntity[attribute.SYS_CODE] = targetEntity[attribute.SYS_CODE]
        })
        return this.submitSubEntity(subEntity, targetEntity, targetEntityInput)
      })
    }
  }

  /**
   * submitSubEntity is created only for reusing logics and avoid to introduce
   * async for BoM and Routing
   *
   * The SYS_GENRE should be the default genre of the workcenter/material
   * instead of targetEntity['SYS_GENRE'] which is "/PRODUCT_WORKCENTER/", and
   * sourceEntity['SYS_GENRE'] which is "/PROJECT_MANAGEMENT/GENERAL_PROJECT/"
   *
   */
  submitSubEntity(subEntity: any, targetEntity:any, targetEntityInput: any): Observable<any> {

    //for both of BoM and Routing
    return this.genreService.retrieveBy({
      "SYS_ENTITY": targetEntity.id
    })
    .mergeMap(data => {
      if (data[0]) {
        // Get SYS_GENRE from the workcenter

        subEntity['SYS_GENRE'] = data[0].id
      } else {
        // Collection of materials may not contains any SYS_GENRE defaultly

        subEntity['SYS_GENRE'] = targetEntity['SYS_GENRE']
      }

      // Assign new values to the new material object
      Object.keys(targetEntityInput).forEach(key => {
        subEntity[key] = targetEntityInput[key]
      })
      return this.entityService.create(subEntity)
    })
    .retryWhen(
      attempts => Observable.range(1, 20)
      .zip(attempts, i => i)
      .mergeMap(i => {
        console.log("delay retry by " + i + " seconds")
        return Observable.timer(i * 1000);
      }))
  }
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action)
  }

  showMessage(message: string, action: string) {
    this.snackBar.open(message, action, {duration: 4000})
  }
}
