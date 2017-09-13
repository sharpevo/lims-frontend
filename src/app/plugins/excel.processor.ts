import {Component, Input, ViewChild} from '@angular/core'
import {EntityService} from '../entity/service'
import {GenreService} from '../genre/service'
import {SampleService} from '../models/sample'
import {UtilService} from '../util/service'

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
  constructor(
    private utilService: UtilService,
    private entityService: EntityService,
    private genreService: GenreService,
    private sampleService: SampleService,
  ){}

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
    window.open(this.utilService.getExcelUrl(this.selectedSampleList, this.workcenter.id))
  }

  updateExcel(){

    // Get the genre of given workcenter
    this.entityService.retrieveGenre(this.workcenter.id)
    .subscribe(data => {

      // Get the attributes from the first genre
      this.genreService.retrieveAttribute(data[0].id)
      .subscribe(workcenterAttributeList => {
        workcenterAttributeList.forEach(attr => {

          console.log("..")
          let parentMap = {}
          if (attr.SYS_TYPE == 'entity' && !attr.SYS_TYPE_ENTITY_REF) {
            parentMap[attr.SYS_CODE] = {}

            // Get the entities under the BoM, note that the empty string indicates
            // the "object" entity type which is implemented in the entityService.
            this.entityService.retrieveEntity(attr.SYS_TYPE_ENTITY.id, "")
            .subscribe(data => {
              data.forEach(material => {
                parentMap[attr.SYS_CODE][material.id] = {}
                material['SYS_SCHEMA'].forEach(materialAttr => {
                  parentMap[attr.SYS_CODE][material.id][materialAttr.SYS_CODE] =
                    material[materialAttr.SYS_CODE]
                })
                // Manually append the SYS_FLOOR_ENTITY_TYPE in BoM/Routing entry
                parentMap[attr.SYS_CODE][material.id]['SYS_FLOOR_ENTITY_TYPE'] =
                  attr.SYS_FLOOR_ENTITY_TYPE
              })
              console.log("xx", workcenterAttributeList)
              this.excelResult.forEach(sample =>{

                // Convert excel-style object to database-style object.
                // The excel-style object is formed as:
                // 'LABEL': 'Value'
                this.entityService.retrieveBy({
                  "_id": sample.IDENTIFIER
                })
                .subscribe(data => {
                  let mergedSample = data[0]

                  mergedSample.SYS_SCHEMA.forEach(schema => {
                    if (sample[schema.SYS_LABEL]){
                      mergedSample[schema.SYS_CODE] = sample[schema.SYS_LABEL]
                    }
                  })
                  this.sampleService.submitSample(
                    this.workcenter,
                    mergedSample,
                    data[0],
                    {
                      "attributeList": workcenterAttributeList,
                      "parentMap": parentMap
                    })
                })
              })
            })
          }
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

