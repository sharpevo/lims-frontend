import { Component } from '@angular/core';
import {EntityService} from './entity/service'
import {UtilService} from './util/service'
import {environment} from '../environments/environment'
import {URLSearchParams} from "@angular/http"
import {MdSnackBar} from '@angular/material'
import {SpinnerService} from './util/spinner.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  serviceList: any[] = []
  environment = environment
  userInfo: any

  constructor(
    public snackBar: MdSnackBar,
    private utilService: UtilService,
    private spinnerService: SpinnerService,
    private entityService: EntityService
  ){}

  ngOnInit(){
    this.utilService.getUserInfo()
    .subscribe(userInfo =>{
      this.userInfo = userInfo
      this.getServiceList()
      this.getParams()
    },
    err => {
      console.log("invalid user")
      this.spinnerService.start()
      this.snackBar.open("Redirect to UIC in 3 seconds...", "OK", {duration: 3000})
      .afterDismissed().subscribe(() => {
        this.spinnerService.stop()
        window.location.href = environment.uicUrl +
          "/login?return_to=" +
          environment.limsUrl.replace(/^https?:\/\//,'')
      });
    },
    () => {
    })
  }

  getParams() {
    let params = new URLSearchParams(window.location.search)
    let remember = params.get('?remember')
    let token = params.get('token')

    if (token) {
      this.setCookie("token", token, remember)
    }
  }

  getServiceList(){
    this.entityService.retrieveByType("domain")
    .subscribe(
      data => {
        this.serviceList = data
      }
    )
  }

  setLanguage(language: string) {
    localStorage.setItem('locale', language)
    location.reload(true)
  }

  setCookie(name: string, value: string, remember: string, path: string = ""){
    let date = new Date()
    let minutes: number
    if (remember == "true"){
      minutes = 7200 // 5 * 24 * 60
    } else {
      minutes = 30
    }
    date.setTime(date.getTime() + minutes * 60 * 1000)
    let expires = "expires=" + date.toUTCString()
    document.cookie = name + "=" + value + "; " +  expires + (path.length > 0 ? "; path=" + path : "")
    console.log("cookie", document.cookie)
  }
}
