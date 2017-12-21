import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {AttributeService} from '../attribute/service'
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
  test: string = ''

  constructor(
    private entityService: EntityService,
    private attributeService: AttributeService,
    private sampleService: SampleService,
  ) {}

  ngOnInit(){
    this.updatePreviousCheckedList()
    console.log(this.previousCheckedList)
    this.getConstGenre()
  }

  ngDoCheck(){
    if (this.isSampleListChanged()){
      this.validateIndices()
    }
  }

  getConstGenre(){
    Object.keys(this.codeMap).forEach(key => {
      this.attributeService.retrieveBy({
        "SYS_CODE": this.codeMap[key]
      })
      .subscribe(data => {
        this.genreMap[key] = data[0].SYS_GENRE.id
      })
    })
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
      let sample = this.selectedSampleList[i]
      if (!this.sampleMap[sample.id]){
        this.sampleMap[sample.id] = {}
      }
      let mi5 = ''
      if (this.sampleMap[sample.id][this.codeMap['MI5_SEQN_KEY']]) {
        mi5 = this.sampleMap[sample.id][this.codeMap['MI5_SEQN_KEY']]
        if (mi5 == '---'){
          mi5 = ''
        }
      }
      let mi7 = ''
      if (this.sampleMap[sample.id][this.codeMap['MI7_SEQN_KEY']]) {
        mi7 = this.sampleMap[sample.id][this.codeMap['MI7_SEQN_KEY']]
        if (mi7 == '---'){
          mi7 = ''
        }
      }
      let si7 = ''
      if (this.sampleMap[sample.id][this.codeMap['SI7_SEQN_KEY']]) {
        si7 = this.sampleMap[sample.id][this.codeMap['SI7_SEQN_KEY']]
        if (si7 == '---'){
          si7 = ''
        }
      }

      let key = si7 + mi7 + mi5
      console.log("Sequence", key)
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
