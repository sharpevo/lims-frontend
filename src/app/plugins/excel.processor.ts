import {Component, Input, ViewChild} from '@angular/core'
import {EntityService} from '../entity/service'
import {GenreService} from '../genre/service'
import {SampleService} from '../models/sample'
import {UtilService} from '../util/service'
import 'rxjs/Rx' ;

@Component({
  selector: 'plugin-excel-processor',
  templateUrl: './excel.processor.html',
})
export class PluginExcelProcessorComponent {
  @Input() workcenter
  @Input() sampleList
  @ViewChild('excelUploader') excelUploader
  selectedSampleList: any[] = []
  excelResult: any[] = []
  parentMap: any = {} // parent entity like BoM or Routing
  entityMap: any = {} // entity type like operator
  workcenterAttributeList: any[] = []
  constructor(
    private utilService: UtilService,
    private entityService: EntityService,
    private genreService: GenreService,
    private sampleService: SampleService,
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

          console.log("..")

          // Process BoM or Routing
          if (attr.SYS_TYPE == 'entity' && !attr.SYS_TYPE_ENTITY_REF) {
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
      this.excelResult = data[0]
    })
  }

  clearExcel(){
    this.excelResult = []
    this.excelUploader.nativeElement.value = ''
  }

  exportSample(){
    this.selectedSampleList = this.sampleList.filter(sample => sample.TMP_CHECKED)
    if (this.selectedSampleList.length > 0){
      this.utilService.getExcelFile(this.selectedSampleList, this.workcenter.id)
      .subscribe(data => {
        var blob = new Blob([data], { type: 'text/csv' });
        var url= window.URL.createObjectURL(blob)
        window.open(url);
      })
    }
  }

  updateExcel(){

    this.excelResult.forEach(sample =>{

      // Convert excel-style object to database-style object.
      // The excel-style object is formed as:
      // 'LABEL': 'Value'
      this.entityService.retrieveBy({
        "_id": sample.IDENTIFIER
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
    })
  }

  updateExcel2(){
    this.utilService.putExcel(this.excelResult)
    .subscribe(data => {
      console.log(data)
      this.selectedSampleList.forEach(sample => sample.TMP_CHECKED = false)
    })
  }

}

