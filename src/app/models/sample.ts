import {Injectable} from '@angular/core'
import {EntityService} from '../entity/service'

@Injectable()
export class SampleService{

  constructor(private entityService: EntityService){}

  buildSampleInlineList(sampleList: any[]): any[]{
    let resultList: any[] = []
    for (let i = 0; i < sampleList.length; i++){
      let capCode = sampleList[i]['CAPTURE_CODE']
      if (capCode) {
        if (!resultList[capCode]){
          resultList[capCode] = {}
        }
        resultList[capCode]['TMP_CODE'] = 'CAPTURE_CODE'
        if (!resultList[capCode]['TMP_SAMPLES']){
          resultList[capCode]['TMP_SAMPLES'] = []
        }
        resultList[capCode]['TMP_SAMPLES'].push(sampleList[i])
      } else {
        resultList['TMP_CODE']['TMP_SAMPLES'].push(sampleList[i])
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
}
