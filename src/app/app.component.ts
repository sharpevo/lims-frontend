import { Component } from '@angular/core';
import {EntityService} from './entity/service'
import {UtilService} from './util/service'
import {environment} from '../environments/environment'
import {URLSearchParams} from "@angular/http"
import {MdSnackBar} from '@angular/material'
import {SpinnerService} from './util/spinner.service'
import {UserService} from './util/user.service'
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  serviceList: any[] = []
  environment = environment
  userInfo: any
  subscription: Subscription
  constructor(
    public snackBar: MdSnackBar,
    private utilService: UtilService,
    private userService: UserService,
    private spinnerService: SpinnerService,
    private entityService: EntityService
  ){}

  ngOnInit(){
    this.userInfo = this.userService.getUserInfo()
    .subscribe(data => {
      this.userInfo = data
    })
    this.getParams()
  }

  getParams() {
    let params = new URLSearchParams(window.location.search)
    let remember = params.get('?remember')
    let token = params.get('token')

    if (token) {
      this.setCookie("token", token, remember)
    }
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
