import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {AttributeService} from '../attribute/service'
import {SampleService} from '../models/sample'
import {Observable} from 'rxjs/Observable'

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
  codeMap: any = {
    "MI7_SEQN_KEY": "SYS_M_INDEX_SEQUENCE_I7",
    "MI7_CODE_KEY": "SYS_M_INDEX_CODE_I7",
    "MI5_SEQN_KEY": "SYS_M_INDEX_SEQUENCE_I5",
    "MI5_CODE_KEY": "SYS_M_INDEX_CODE_I5",
    "SI7_SEQN_KEY": "SYS_S_INDEX_SEQUENCE_I7",
    "SI7_CODE_KEY": "SYS_S_INDEX_CODE_I7",
  }
  genreMap: any = {}
  sampleMap: any = {}
  seqMap: any = {}
  test: string = ''

  constructor(
    private entityService: EntityService,
    private attributeService: AttributeService,
    private sampleService: SampleService,
  ) {}

  ngOnInit(){
    this.updatePreviousCheckedList()
    console.log(this.previousCheckedList)
    Object.keys(this.codeMap).forEach(key => {
      this.attributeService.retrieveBy({
        "SYS_CODE": this.codeMap[key]
      })
      .subscribe(data => {
        this.genreMap[key] = data[0].SYS_GENRE.id
      })
    })
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
    this.seqMap = []
    if (this.selectedSampleList.length == 0){
      return
    }
    let sampleObs = []
    for (let i=0; i<this.selectedSampleList.length; i++){
      let sample = this.selectedSampleList[i]
      this.resultList[i] = true

      this.sampleMap[sample.id] = {}
      Object.keys(this.codeMap).forEach(key => {
        sampleObs.push(
          this.sampleService.retrieveAuxiliaryAttributeList(
            sample,
            this.codeMap[key],
            this.genreMap[key])
            .map(data => {
              return {'key': key, 'attrValueList': data, 'sampleId': sample.id, 'index': i}
            })
        )
      })

    } // end of for loop

    Observable
    .forkJoin(sampleObs)
    .subscribe(data => {
      console.log("DATA", data)
      data.forEach(result => {
        let key = result['key']
        let attr = result['attrValueList']
        let sampleId = result['sampleId']
        let index = result['index']
        this.sampleMap[sampleId][this.codeMap[key]] = attr.length > 0?attr[0]['value']:''
      })

      this.result = true
      this.selectedSampleList.forEach((sample, index) => {
        this.checkSequence(sample.id, index)
      })
    })

  }

  checkSequence(sampleId: string, index: number){
    let mi5 = this.sampleMap[sampleId][this.codeMap['MI5_SEQN_KEY']]
    let mi7 = this.sampleMap[sampleId][this.codeMap['MI7_SEQN_KEY']]
    let si7 = this.sampleMap[sampleId][this.codeMap['SI7_SEQN_KEY']]
    let key = si7 + mi7 + mi5
    if (this.seqMap.hasOwnProperty(key) && Number(this.seqMap[key]) != index){
      console.log("duped: ", sampleId, key, this.seqMap)
      this.result = false
      this.resultList[index] = false
      this.resultList[Number(this.seqMap[key])] = false
    } else if (key) {
      this.seqMap[key] = '' + index
      this.resultList[index] = true
    }
    //console.log("sample: ", sampleId, "index: " + index, "key: " + key, this.seqMap, "resultList", this.resultList)
  }

}
