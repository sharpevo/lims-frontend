import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {SampleService} from '../models/sample'

@Component({
  selector: 'plugin-index-validator',
  templateUrl: './index.validator.html',
  styleUrls: ['./index.validator.css']
})
export class PluginIndexValidatorComponent {
  @Input() sampleList
  selectedSampleList: any[] = []
  result: boolean = true
  previousCheckedList: boolean[] = []
  resultList: boolean[] = []

  constructor(
    private entityService: EntityService,
    private sampleService: SampleService,
  ) {}

  ngOnInit(){
    this.updatePreviousCheckedList()
    console.log(this.previousCheckedList)
  }

  ngDoCheck(){
    if (this.isSampleListChanged()){
      this.validateIndices()
    }
  }

  updatePreviousCheckedList(){
    this.previousCheckedList = []
    for (let i=0; i<this.sampleList.length; i++){
      let sample = this.sampleList[i]
      if (sample['TMP_CHECKED']){
        this.previousCheckedList.push(true) 
      } else {
        this.previousCheckedList.push(false) 
      }
    }
  }

  isSampleListChanged(): boolean{
    for (let i=0; i<this.sampleList.length; i++){
      let sample = this.sampleList[i]
      if (sample['TMP_CHECKED'] != null &&
          sample['TMP_CHECKED'] != this.previousCheckedList[i]){
        console.log("==", sample['TMP_CHECKED'], this.previousCheckedList[i])
      this.updatePreviousCheckedList()
      return true
      }
    }
    return false
  }

  validateIndices(){
    this.selectedSampleList = this.sampleList.filter(sample => sample.TMP_CHECKED)
    this.resultList = []
    let resultFlag = true
    if (this.selectedSampleList.length == 0){
      return
    }
    let seqMap = {}
    //for (let sample of this.selectedSampleList; let i = index){
    for (let i=0; i<this.selectedSampleList.length; i++){
      let key = this.selectedSampleList[i]['SYS_INDEX_SEQUENCE']
      //console.log(key)
      //console.log(seqMap[key])
      //if (seqMap[sample['SYS_INDEX_SEQUENCE']] === '') {

      // key != null to treat blank index sequence as invalid one
      if (seqMap[key] == null && key != null) {
        // id is more stable than SYS_SAMLPE_CODE
        // or index note that 0=='' returns true
        seqMap[key] = ''+i
        this.resultList[i] = true
      } else {
        this.result = false
        resultFlag = false
        this.resultList[i] = false
        this.resultList[Number(seqMap[key])] = false
        // keep validating for all the left samples
        // return
      }
    }
    if (resultFlag){
      this.result = true
    } else {
      this.result = false
    }

  }

}
