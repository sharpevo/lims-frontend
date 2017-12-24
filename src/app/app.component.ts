import { Component } from '@angular/core';
import {EntityService} from './entity/service'
import {UtilService} from './util/service'
import {environment} from '../environments/environment'
import {URLSearchParams} from "@angular/http"
import {MdSnackBar} from '@angular/material'
import {SpinnerService} from './util/spinner.service'
import {UserService} from './util/user.service'
import { Subscription } from 'rxjs/Subscription';
import {Router} from '@angular/router'

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
  interval: any
  showMessage: boolean = true
  taskCompletedList: any[] = [
    {
      title: "#75 优化任务下达",
      date: "2017-12-17",
    },
    {
      title: "#77 指定工作中心物料清单同Excel文件上传处理",
      date: "2017-12-19",
    },
    {
      title: "#88 经Excel上传实现任务批量下达同时Sheet2配置工艺流程",
      date: "2017-12-21",
    },
    {
      title: "#100 优化工作中心",
      date: "2017-12-22",
    },
    {
      title: "#98 修复双端Index校验bug",
      date: "2017-12-22",
    },
    {
      title: "#103 增加物料管理入口",
      date: "2017-12-23",
    },
    {
      title: "#104 增加样品查询模块",
      date: "2017-12-24",
    }

  ]
  taskPlannedList: any[] = [
    {
      title: "#78 工作中心文件上传(不解析)并在线预览(pdf)",
      date: "Week: 52",
    },
    {
      title: "#99 修复Excel导出部分参考属性缺失bug",
      date: "Week: 52",
    },
    {
      title: "#15 优化钉钉通知(样品链接, CardAction链接等)",
      date: "Week: 52",
    },
  ]
  constructor(
    public snackBar: MdSnackBar,
    private utilService: UtilService,
    private userService: UserService,
    private spinnerService: SpinnerService,
    private entityService: EntityService,
    private router: Router,
  ){}

  ngOnInit(){

    this.checking()
    this.interval = setInterval(() => {
      this.checking()
    }, 1000 * 60)
    this.getParams()
  }

  ngOnDestroy() {
    if (this.interval) {
      console.log("clear jobs")
      clearInterval(this.interval)
    }
  }

  checking() {
    this.utilService.checkAvailability()
    .subscribe(data => {
      console.log("check", data)
      this.userInfo = this.userService.getUserInfo()
    },
    error => {
      console.log("backend failded", error)
      this.userService.authFail()
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

  refresh(){
    this.router.navigate(['/redirect' + this.router.url])
  }

  onActivate(event: any){
    this.showMessage = false
    console.log("ACTIVATE")
  }
  onDeactivate(event: any){
    this.showMessage = true
    console.log("DEACTIVATE")
  }
}
