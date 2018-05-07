import {Injectable} from '@angular/core'
import {Http, Headers, ResponseContentType} from '@angular/http'
import {environment} from '../../environments/environment'
import 'rxjs/add/operator/map'
import {CustomHttpService} from '../util/custom.http.service'

@Injectable()
export class UtilService {
    private baseUrl: string = environment.apiUrl
    private notifUrl: string = environment.limsbotUrl
    private limsUrl: string = environment.limsUrl
    private headers: Headers
    constructor(
        private http: CustomHttpService,
        private rawHttp: Http
    ) {
        this.headers = new Headers()
        this.headers.append('Content-Type', 'application/json')
        this.headers.append('Accept', 'application/json')
    }

    postExcel(file: any) {
        let formData = new FormData()
        formData.append('excelFile', file[0], file[0].name)
        return this.http.post(
            '/excelparse',
            formData)
            .map(res => res.json())
    }

    getExcelFile(hybridObjectMap: any, workcenterId: string, attributeList: any[]) {
        let data = {}
        data['workcenterId'] = workcenterId
        data['hybridObjectMap'] = hybridObjectMap
        data['attributeList'] = attributeList
        let headers = new Headers()
        headers.append('Content-Type', 'application/json')
        //headers.append('Accept', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        return this.http.post(
            '/excel',
            data,
            {
                headers: headers,
                responseType: ResponseContentType.Blob
            })
        //.map(response => new Blob([response['_body']],{ type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}))
    }

    getExcelUrl(sampleList: any, workcenterId: string) {
        let ids = ''
        sampleList.forEach(sample => {
            if (ids == '') {
                ids = sample.id
            } else {
                ids += ',' + sample.id
            }

        })
        return this.baseUrl + `/excel?ids=${ids}&workcenter=${workcenterId}`
    }

    putExcel(objectList: any[]) {
        return this.http.put(
            '/excel',
            JSON.stringify(objectList),
            {headers: this.headers})
            .map(res => res.json())
    }

    /**
     * Send message to dingtalk
     *
     * @param msgtype "text", "actionCard", "actionsCard".
     * @param content The content of the message
     * @param sourceUrl The URL of the message
     *
     */
    sendNotif(msgtype: string, content: string, sourceUrl: string) {
        let data = {
            "msgtype": msgtype,
            "title": "LIMS Notification",
            "content": content,
            "actionurl": sourceUrl
        }

        return this.rawHttp.post(
            this.notifUrl,
            data,
            {headers: this.headers}
        )
        //.map(res => res.json())
    }

    restoreDatabase() {
        return this.http.get("/restore")
            .map(res => res.json())
    }

    getDocSet(operatorID, sampleCode) {
        let ts = new Date().getTime() // milliseconds since 1970-1-1
        return operatorID + '_' + sampleCode + '_' + ts
    }
}
