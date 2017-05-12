import {Injectable} from '@angular/core'
import {EntityService} from '../entity/service'

@Injectable()
export class SampleService{

  constructor(private entityService: EntityService){}

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
}