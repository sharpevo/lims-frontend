import {Component, Input, ViewChild} from '@angular/core'
import {EntityService} from '../entity/service'
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
    window.open(this.utilService.getExcelUrl(this.selectedSampleList, this.workcenter.label))
  }

  updateExcel(){
    this.utilService.putExcel(this.excelResult)
    .subscribe(data => {
      console.log(data)
      this.selectedSampleList.forEach(sample => sample.TMP_CHECKED = false)
    })
  }

}
