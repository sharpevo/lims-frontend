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

}
