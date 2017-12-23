import {Component, Input, ViewChild} from '@angular/core'
import {EntityService} from '../entity/service'
import {GenreService} from '../genre/service'
import {SampleService} from '../models/sample'
import {UtilService} from '../util/service'
import 'rxjs/Rx' ;
import {DatePipe} from '@angular/common'
import {Router} from '@angular/router'

@Component({
  selector: 'plugin-excel-processor',
  templateUrl: './excel.processor.html',
  styleUrls: ['./excel.processor.css']
})
export class PluginExcelProcessorComponent {
  @Input() workcenter
  @Input() sampleList
  @Input() hybridObjectMap
  @ViewChild('excelUploader') excelUploader
  selectedSampleList: any[] = []
  excelResultSample: any[] = []
  excelResultGroup: any[] = []
  parentMap: any = {} // parent entity like BoM or Routing
  parentMapKey: string = ''
  parentMapFloor: string = ''
  entityMap: any = {} // entity type like operator
  workcenterAttributeList: any[] = []
  constructor(
    private utilService: UtilService,
    private entityService: EntityService,
    private genreService: GenreService,
    private sampleService: SampleService,
    private router: Router,
  ){}

  ngOnInit(){
    this.generateParentMap()
  }

  generateParentMap(){
    // Get the genre of given workcenter
    this.entityService.retrieveGenre(this.workcenter.id)
    .subscribe(data => {

      // Get the attributes from the first genre
      this.genreService.retrieveAttribute(data[0].id)
      .subscribe(attributeList => {
        this.workcenterAttributeList = attributeList
        this.workcenterAttributeList.forEach(attr => {

          // Process BoM or Routing
          if (attr.SYS_TYPE == 'entity' && !attr.SYS_TYPE_ENTITY_REF) {
            this.parentMapKey = attr.SYS_CODE
            this.parentMapFloor = attr.SYS_FLOOR_ENTITY_TYPE
            this.parentMap[attr.SYS_CODE] = {}

            // Get the entities under the BoM, note that the empty string indicates
            // the "object" entity type which is implemented in the entityService.
            this.entityService.retrieveEntity(attr.SYS_TYPE_ENTITY.id, "")
            .subscribe(data => {
              data.forEach(material => {
                this.parentMap[attr.SYS_CODE][material.id] = {}
                material['SYS_SCHEMA'].forEach(materialAttr => {
                  this.parentMap[attr.SYS_CODE][material.id][materialAttr.SYS_CODE] =
                    material[materialAttr.SYS_CODE]
                })
                // Manually append the SYS_FLOOR_ENTITY_TYPE in BoM/Routing entry
                this.parentMap[attr.SYS_CODE][material.id]['SYS_FLOOR_ENTITY_TYPE'] =
                  attr.SYS_FLOOR_ENTITY_TYPE
              })
            })
          }
        })
      })
    })
  }

  submitExcel(event){
    let file = event.srcElement.files;
    let postData = {field1:"field1", field2:"field2"}; // Put your form data variable. This is only example.
    console.log(file)
    this.utilService.postExcel(file)
    .subscribe(data => {
      this.excelResultSample = data[0]
      this.excelResultGroup = data[1]
    })
  }

  clearExcel(){
    this.excelResultSample = []
    this.excelResultGroup = []
    this.excelUploader.nativeElement.value = ''
  }

  exportSample(template?: boolean){
    this.selectedSampleList = this.sampleList.filter(sample => sample.TMP_CHECKED)
    let hybridSampleList = this.sampleService.buildHybridSampleList(this.selectedSampleList, this.hybridObjectMap)
    console.log("hybridSampleList:", hybridSampleList)

    if (this.selectedSampleList.length > 0 || template){
      if (template){
        hybridSampleList = []
      }
      this.utilService.getExcelFile(hybridSampleList, this.workcenter.id)
      .subscribe(data => {
        console.log(data)
        var blob = new Blob([data['_body']],{ type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'} )
        //var file = new File([blob], 'report.xlsx',{ type: 'application/vnd.ms-excel' } )
        //var url= window.URL.createObjectURL(file)
        //window.open(url, '_blank');
        //window.open(url);

        const pdfUrl = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');

        let timestamp = new DatePipe('en-US').transform(new Date(), 'yyyyMMdd.HHmmss')
        anchor.download = this.workcenter[this.workcenter['SYS_LABEL']] + '.' + timestamp + '.xlsx';
        anchor.href = pdfUrl;
        anchor.click()
      })
    }
    console.log("PARENTMAP", this.parentMap)
  }

  updateExcel(){

    // update the parentMap according to the excel if another sheets provides some.
    if (this.excelResultGroup.length > 0){
      this.parentMap = {}
      this.parentMap[this.parentMapKey] = {}
    }
    this.excelResultGroup.forEach(groupInExcel => {

      console.log("groupInExcel", groupInExcel)
      let groupId = groupInExcel['IDENTIFIER']
      if (groupId) {

        // retrieve the group item (object with the given id)
        this.entityService.retrieveBy({"_id": groupId})
        .subscribe(data => {
          let group = data[0]
          if (this.parentMapFloor == "collection"){
            // bom, get the first lot for uploading / default
            // sort by the lot label

            // retrive collections/LOTs under the given material
            this.entityService.retrieveEntity(group['SYS_SOURCE'], "collection")
            .subscribe(data => {

              console.log("material", data)
              // get the delfault lot in the array sorted by the SYS_CODE
              // e.g. LOT160810
              let defaultMaterial = {}

              // get the default material
              let defaultMaterialList = data.filter(material => material['SYS_IS_DEFAULT'])
              if (defaultMaterialList.length > 0) {
                defaultMaterial = defaultMaterial[0]
              } else {
                // if default flag is not set well, get the oldest lot
                defaultMaterial = data.sort((a,b) => {
                  if (a['createAt'] < b['createdAt']) {
                    return 1
                  } else {
                    return -1
                  }
                })[0]
              }
              groupId = defaultMaterial['id']

              console.log("group", groupId)
              this.parentMap[this.parentMapKey][groupId] = {}
              group.SYS_SCHEMA.forEach(schema => {
                Object.keys(groupInExcel).forEach(key => {
                  if (schema.SYS_LABEL == key){
                    this.parentMap[this.parentMapKey][groupId][schema.SYS_CODE] = groupInExcel[key]
                  }
                })
              })
              this.parentMap[this.parentMapKey][groupId]['SYS_SOURCE'] = groupId // defaultMaterial
              this.parentMap[this.parentMapKey][groupId]['SYS_CHECKED'] = true
              this.parentMap[this.parentMapKey][groupId]['SYS_FLOOR_ENTITY_TYPE'] = this.parentMapFloor
            })
          } else {
            console.log("group", groupId)
            this.parentMap[this.parentMapKey][groupId] = {}
            group.SYS_SCHEMA.forEach(schema => {
              Object.keys(groupInExcel).forEach(key => {
                if (schema.SYS_LABEL == key){
                  this.parentMap[this.parentMapKey][groupId][schema.SYS_CODE] = groupInExcel[key] // overwrited by the backend data
                }
              })
            })
            this.parentMap[this.parentMapKey][groupId]['SYS_SOURCE'] = groupId
            this.parentMap[this.parentMapKey][groupId]['SYS_CHECKED'] = true // mimic submited in the form
            this.parentMap[this.parentMapKey][groupId]['SYS_FLOOR_ENTITY_TYPE'] = this.parentMapFloor
          }
        })
      }
    })
    console.log("NEW PARENTMAP", this.parentMap)

    //return
    //}
    //updateExcelRaw(){

    this.excelResultSample.forEach(sample =>{

      let sampleId = sample['IDENTIFIER']
      if (sampleId) {
        // Convert excel-style object to database-style object.
        // The excel-style object is formed as:
        // 'LABEL': 'Value'
        this.entityService.retrieveBy({
          "_id": sampleId
        })
        .subscribe(data => {
          let mergedSample = data[0]

          //
          // For the reason of SYS_GENRE is defined from General project instead
          // of the current workcenter in the legacy database:
          // 1. schema: from workcenter, like sample sn
          // 2. sample: from excel, like operator, id, exactly the workcenter
          //
          mergedSample.SYS_SCHEMA.forEach(schema => {
            console.log("!!!", sample, schema)
            if (sample[schema.SYS_LABEL]){
              if (schema.SYS_TYPE != 'entity'){
                mergedSample[schema.SYS_CODE] = sample[schema.SYS_LABEL]
              } else {
                mergedSample[schema.SYS_CODE] = sample[schema.SYS_LABEL]

                // TODO: Convert SYS_LABEL to id before commit to the database
                //let queryObject = {}
                //queryObject[schema.SYS_LABEL] = sample[schema.SYS_LABEL]
                //this.entityService.retrieveBy(queryObject)
                //.subscribe(data => {
                //if (data[0]){
                //console.log("Entity:", data[0])
                //mergedSample[schema.SYS_CODE] = data[0].id
                //} else {
                //console.warn("Invalid " + schema.SYS_LABEL + sample[schema.SYS_LABEL])
                //}
                //})
              }
            }
          })
          this.sampleService.submitSample(
            this.workcenter,
            mergedSample,
            data[0],
            {
              "attributeList": this.workcenterAttributeList,
              "parentMap": this.parentMap
            })
        })
      } else {
        // issue sample

        // only allow sample creation at General Project Workcenter
        if (this.workcenter.SYS_IDENTIFIER != "/PROJECT_MANAGEMENT/GENERAL_PROJECT") {
          console.error("Not allowed to upload samples at this workcenter", this.workcenter.SYS_IDENTIFIER)
          return
        }

        let newSample = {}
        this.workcenterAttributeList.forEach(attr => {
          newSample[attr.SYS_CODE] = sample[attr[attr['SYS_LABEL']]]
        })

        this.entityService.retrieveGenre(this.workcenter.id)
        .subscribe(data => {
          newSample['SYS_GENRE'] = data[0]
          newSample['SYS_LABEL'] = 'SYS_SAMPLE_CODE'
          newSample['SYS_ENTITY_TYPE'] = 'collection'

          newSample['SYS_IDENTIFIER'] = this.workcenter['SYS_IDENTIFIER'] +
            '/' +
            newSample['SYS_SAMPLE_CODE'] + '.' +
            new DatePipe('en-US').transform(new Date(), 'yyyyMMddHHmmss')

          this.sampleService.createObject(
            newSample,
            {
              "attributeList": this.workcenterAttributeList,
              "parentMap": this.parentMap,
            },
            true)
        })

      }
    })
  }

  updateExcel2(){
    this.utilService.putExcel(this.excelResultSample)
    .subscribe(data => {
      console.log(data)
      this.selectedSampleList.forEach(sample => sample.TMP_CHECKED = false)
    })
  }

}

