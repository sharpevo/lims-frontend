import { Component } from '@angular/core';
import {EntityService} from './entity/service'
import {UtilService} from './util/service'
import {environment} from '../environments/environment'
import {URLSearchParams} from "@angular/http"
import {MdSnackBar} from '@angular/material'
import {SpinnerService} from './util/spinner.service'
import {UserInfoService} from './util/user.info.service'
import {AuthService} from './util/auth.service'
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
      title: "#197 审计前端",
      date: "2018-02-09",
      highlight: true,
      url: "http://audit.lims.igenetech.cn",
    },
    {
      title: "#197 审计后端",
      date: "2018-02-02",
      highlight: true,
    },
    {
      title: "#198(HOTFIX) 任务下达bug",
      date: "2018-01-29",
      highlight: true,
    },
    {
      title: "#193 修复请求体过大导致的拒绝服务",
      date: "2018-01-25",
      highlight: true,
    },
    {
      title: "#195 修复混样样品详单编号缺失bug",
      date: "2018-01-25",
      highlight: true,
    },
    {
      title: "#194 Simple Table多列查询",
      date: "2018-01-25",
      highlight: true,
    },
    {
      title: "#180 修复混合样品Index导出缺失Bug",
      date: "2018-01-25",
      highlight: true,
    },
    {
      title: "#190 Simple Table性能优化",
      date: "2018-01-24",
      highlight: true,
    },
    {
      title: "#183 绩效统计及建库液相数量统计",
      date: "2018-01-17",
      highlight: true,
    },
    //{
    //title: "#170 服务器迁移至先知主机",
    //date: "2018-01-12",
    //highlight: true,
    //},
    //{
    //title: "#181 样品表性能优化",
    //date: "2018-01-12",
    //highlight: true,
    //},
    //{
    //title: "#179 调整项目编号表头及表体(完整显示)",
    //date: "2018-01-11",
    //highlight: true,
    //},
    //{
    //title: "移除全部权限检查(避免使用同一帐号测试)",
    //date: "2018-01-11",
    //highlight: true,
    //},
    //{
    //title: "#169 移除SimpleTable调试信息(样品ID)",
    //date: "2018-01-11",
    //highlight: true,
    //},
    //{
    //title: "#178 增加样品表格项目过滤下拉框",
    //date: "2018-01-10",
    //highlight: true,
    //},
    //{
    //title: "#176 属性变更(建库质检评级引自提取; 建库样品用量引自打断实验; Pooling文库长度引自建库;",
    //date: "2018-01-09",
    //highlight: true,
    //},
    //{
    //title: "#158 实验步骤页面显示样品数量(已分派样品数量)",
    //date: "2018-01-08",
    //highlight: true,
    //},
    //{
    //title: "#166 建库属性变更(样品投入量/剩余量引子提取实验)",
    //date: "2018-01-08",
    //highlight: true,
    //},
    //{
    //title: "#163 修复样品项目参考属性bug",
    //date: "2018-01-05",
    //},
    //{
    //title: "#164 项目审核属性变更",
    //date: "2018-01-04",
    //},
    //{
    //title: "#162 simple-table UI优化(overflow, 滚动条)",
    //date: "2018-01-04",
    //},
    //{
    //title: "#161 Excel插件按钮变更(任务下达'模板'与实验流程'导出')",
    //date: "2018-01-04",
    //},
    //{
    //title: "#156 任务下达属性变更(属性顺序, 多重/液相属性区分等)",
    //date: "2018-01-04",
    //},
    //{
    //title: "#99 修复Excel导出部分参考属性缺失bug(一定程度修复)",
    //date: "2017-12-28",
    //},
    //{
    //title: "#152 取消自动数据库重置(前端手动重置)",
    //date: "2017-12-28",
    //},
    //{
    //title: "#15 优化钉钉通知(样品链接, CardAction链接等)",
    //date: "2017-12-27",
    //},
    //{
    //title: "#141 修复计划进度bug(WPS数据类型所致)",
    //date: "2017-12-26",
    //},
    //{
    //title: "#140 样品Excel导出前按样品编号升序排序",
    //date: "2017-12-25",
    //},
    //{
    //title: "#138 增加缺失前端国际化字段(任务下达/插件等)",
    //date: "2017-12-25",
    //},
    //{
    //title: "#106 增加样品查询模块(项目编号, 日期范围)",
    //date: "2017-12-24",
    //},
    //{
    //title: "#104 增加简单样品详情",
    //date: "2017-12-24",
    //},
    //{
    //title: "#103 增加简单物料管理",
    //date: "2017-12-23",
    //},
    //{
    //title: "#98 修复双端Index校验bug",
    //date: "2017-12-22",
    //},
    //{
    //title: "#100 优化工作中心",
    //date: "2017-12-22",
    //},
    //{
    //title: "#88 经Excel上传实现任务批量下达同时Sheet2配置工艺流程",
    //date: "2017-12-21",
    //},
    //{
    //title: "#77 指定工作中心物料清单同Excel文件上传处理",
    //date: "2017-12-19",
    //},
    //{
    //title: "#75 优化任务下达",
    //date: "2017-12-17",
    //},
    {
      title: "",
      date: "",
    },

  ]
  taskPlannedList: any[] = [
    {
      title: "#78 工作中心文件上传(多文件/异步/不解析)并在线预览(pdf) -> 欧婷",
      date: "Week: 02",
    },
    {
      title: "#60 实现项目暂停机制",
      date: "?",
    },
    {
      title: "#76 多重建库UI开发(模拟8x12孔板)",
      date: "?",
    },
    {
      title: "#85 实现'生产组'相关逻辑",
      date: "?",
    },
    {
      title: "#154 实现预警机器人",
      date: "Week: 06",
    },
    {
      title: "#159 Dashboard页面显示样品数量",
      date: "?",
    },
    {
      title: "#165 样品编号校验当批量上传时",
      date: "?",
    },
    {
      title: "#167 实现'撤销'及'回滚'",
      date: "?",
    },
    {
      title: "#189 液相多重实验分开下达",
      date: "Week: 05",
    },
    {
      title: "",
      date: "",
    },
  ]
  constructor(
    public snackBar: MdSnackBar,
    private utilService: UtilService,
    private userInfoService: UserInfoService,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private entityService: EntityService,
    private router: Router,
  ){}

  ngOnInit(){

    //this.checking()
    this.interval = setInterval(() => {
      this.checking()
    }, 1000 * 60)
    this.userInfo = this.userInfoService.getUserInfo()
    this.getParams()
  }

  ngOnDestroy() {
    if (this.interval) {
      console.log("clear jobs")
      clearInterval(this.interval)
    }
  }

  checking() {
    this.authService.checkAvailability()
    .subscribe(data => {
      console.log("check", data)
      this.userInfo = this.userInfoService.getUserInfo()
    },
    error => {
      console.log("backend failded", error)
      this.authService.authFail()
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

  restore(){
    this.utilService.restoreDatabase()
    .subscribe(data => {}, err => {}, () => {
      this.refresh()
    })
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
