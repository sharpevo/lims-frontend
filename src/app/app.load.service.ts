import { Injectable } from '@angular/core';
//import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';
import {UserInfoService} from './util/user.info.service'

import {environment} from '../environments/environment'
import {Http, Headers, Response, RequestOptions, RequestOptionsArgs} from '@angular/http'
//import {CustomHttpService} from './util/custom.http.service'


@Injectable()
export class AppLoadService {

  userInfo: any
  constructor(
    //private httpClient: HttpClient
    //private http: CustomHttpService,
    private http: Http,
    private userInfoService: UserInfoService,
  ) { }

  initializeApp(): Promise<any> {
    console.log("...")
    return new Promise(resolve => {
      this.http.get(
        environment.apiUrl + "/userInfo",
        this.requestOptions()
      )
      //.map((res) => res.json())
      .toPromise().then(res => {
        console.log("CCC:", res)
        this.parseUserInfo(res)

        resolve()
      }).catch(err => {
        console.log("Error:", err)

        window.location.href = environment.uicUrl +
          "/profile?return_to=" +
          environment.limsUrl.replace(/^https?:\/\//,'')
      })
    })

  }

  private requestOptions(options?: RequestOptionsArgs): RequestOptionsArgs {
    if (options == null) {
      options = new RequestOptions()
    }
    if (options.headers == null) {
      options.headers = new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        //'Authorization': `Basic ${environment.basic_auth_token}`,
        //'X-Auth-Token': localStorage.getItem('access_token')
      })
    }
    options.withCredentials = true
    return options
  }

  parseUserInfo(res: Response) {
    if (res.headers.get('igenetech-user-id') == 'undefined'){
      console.log("checked")
      return
    }
    let userInfo = {
      'id':res.headers.get('igenetech-user-id'),
      'email':res.headers.get('igenetech-user-email'),
      'limsid':res.headers.get('igenetech-user-limsid')|| "",
      'name':decodeURIComponent(res.headers.get('igenetech-user-name')),
      'roles':res.headers.get('igenetech-user-roles'),
      'role':JSON.parse(res.headers.get('igenetech-user-role')),
    }
    this.userInfoService.setUserInfo(userInfo)
  }
  //return this.http.get('./src/config.json')
  //.map((res) => res.json())
  //.switchMap(config => {
  //return this.http.get('./src/' + config['URL']).map(r => r.json());
  //}).toPromise().then((r) => {
  //this.config = r;
  //});

  initializeApp2(){//: Promise<any> {
    //return new Promise((resolve, reject) => {
    return this.http.get("/userinfo")
    .map(res => res.json())
    .subscribe(data => {
      console.log("data:", data)
    },
    error => {
      console.log("Error:", error)
    },
    () => {
      console.log("FFF:")

    })

    //})
  }

  //checking() {
  //this.httpClient.get(environment.apiUrl + "/userinfo")
  //.toPromise()
  //.then(data => {
  //})
  //.map(res => res.json())
  //.subscribe(data => {
  //console.log("Check:", data)
  //},
  //error => {
  //console.log("Check:", error)
  //},
  //() => {
  //console.log("Check in the initializer")
  //})

  //}
}
