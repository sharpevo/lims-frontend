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
          resultList[capCode] = []
        }
        resultList[capCode].push(sampleList[i])
      } else {
        resultList.push(sampleList[i])
      }
    }
    return resultList
  }

  getPreviousChainedSample(sample: any, callback){
    console.log("target", sample['SYS_TARGET'])
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
      console.log(index)

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
