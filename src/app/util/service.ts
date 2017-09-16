import {Injectable} from '@angular/core'
import {Http, Headers} from '@angular/http'
import 'rxjs/add/operator/map'

@Injectable()
export class UtilService{
  private baseUrl: string = 'http://dell:3000'
  private headers: Headers
  constructor(private http: Http){
    this.headers = new Headers()
    this.headers.append('Content-Type', 'application/json')
    this.headers.append('Accept', 'application/json')
  }

  postExcel(file: any){
    let formData = new FormData()
    formData.append('excelFile', file[0], file[0].name)
    return this.http.post(
      this.baseUrl + '/excelparse',
      formData,
      {})
      .map(res => res.json())
  }

  getExcelFile(sampleList: any, workcenterId: string){
    let data = {}
    data['workcenterId'] = workcenterId
    data['sampleIdList'] = {}
    sampleList.forEach(sample => {
      //SYS_HYBRID_INFO:{
      //  HYBRID_CODE:"SYS_CAPTURE_CODE"
      //  SYS_CAPTURE_CODE:"cap-01"
      //  type:"CAPTURE"
      //}
      let hybridCodeKey = sample['SYS_HYBRID_INFO']['HYBRID_CODE']
      let hybridCode = sample['SYS_HYBRID_INFO'][hybridCodeKey]
      if (!data['sampleIdList'][hybridCode]){
        data['sampleIdList'][hybridCode] = []
      }
      data['sampleIdList'][hybridCode].push(sample.id)
    })
    let headers = new Headers()
    headers.append('Content-Type', 'application/json')
    headers.append('Accept', '*')
    return this.http.post(
      this.baseUrl + '/excel',
      data,
      {headers: headers})
      //.map(res => res.json())
  }

  getExcelUrl(sampleList: any, workcenterId: string){
    let ids = ''
    sampleList.forEach(sample => {
      if (ids == ''){
        ids = sample.id
      } else {
        ids += ',' + sample.id
      }

    })
    return this.baseUrl + `/excel?ids=${ids}&workcenter=${workcenterId}`
  }

  putExcel(objectList: any[]){
    return this.http.put(
      this.baseUrl + '/excel',
      JSON.stringify(objectList),
      {headers: this.headers})
      .map(res => res.json())
  }

}
