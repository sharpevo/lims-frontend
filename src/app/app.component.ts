import {Component} from '@angular/core';
import {DatePipe} from '@angular/common';
import {EntityService} from './entity/service'
import {UtilService} from './util/service'
import {environment} from '../environments/environment'
import {URLSearchParams} from "@angular/http"
import {MatSnackBar} from '@angular/material'
import {SpinnerService} from './util/spinner.service'
import {UserInfoService} from './util/user.info.service'
import {AuthService} from './util/auth.service'
import {Subscription} from 'rxjs/Subscription';
import {Router} from '@angular/router'
import {LogService} from './log/log.service'
import {LogLocalStorage} from './log/publisher'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    logEntryList = []
    serviceList: any[] = []
    environment = environment
    userInfo: any
    subscription: Subscription
    interval: any
    showMessage: boolean = true
    taskCompletedList: any[] = [
        {
            title: "#265 Execel上传性能优化(7倍) [8d3f1f6]",
            date: "2018-05-25",
            highlight: true,
        },
        {
            title: "#273 重构SampleInfoVerticalComponent [0cf0e90]",
            date: "2018-05-25",
            highlight: true,
        },
        {
            title: "#264 多BoM支持后Excel上传Bugs修复 [80c1abd]",
            date: "2018-05-23",
            highlight: true,
        },
        {
            title: "#262 多BoM支持后SimpleTable Bugs修复 [fd022cf]",
            date: "2018-05-23",
            highlight: true,
        },
        {
            title: "#261 项目管理样品属性多Genre显示 [581ec00]",
            date: "2018-05-22",
            highlight: true,
        },
        {
            title: "#230 根据质量管理部模板更新属性 [b93a4b1, 9841e82]",
            date: "2018-05-18",
            highlight: true,
        },
        {
            title: "#252 样品总表(部分测试) [f39ba43, 708798e]",
            date: "2018-05-18",
            highlight: true,
        },
        {
            title: "#257 重新设计样品重下达 [-]",
            date: "2018-05-15",
            highlight: true,
        },
        {
            title: "#255 重构SampleHistoryComponent [a04fceb7]",
            date: "2018-05-14",
            highlight: true,
        },
        {
            title: "#251 补全方式实时增加物料 [4b4c933]",
            date: "2018-05-11",
            highlight: true,
        },
        {
            title: "#189 液相多重实验分开下达 [0be8929]",
            date: "2018-04-27",
            highlight: true,
        },
        {
            title: "#244 同Workcenter多BoM支持 [d2b089]",
            date: "2018-04-24",
            highlight: true,
        },
        {
            title: "#239 Excel Service单元测试 [bcec91f]",
            date: "2018-04-19",
            highlight: true,
        },
        {
            title: "#232 修复任务下达搜索bug [3078cb5]",
            date: "2018-04-13",
            highlight: true,
        },
        {
            title: "#228 增加日志模块",
            date: "2018-04-12",
            highlight: true,
        },
        {
            title: "#225 重构钉钉消息构建方法",
            date: "2018-04-09",
            highlight: true,
        },
        {
            title: "#60(hotfix) 修复相关bug(非混样及钉钉消息)",
            date: "2018-03-30",
            highlight: true,
        },
        {
            title: "#60 支持混样样品暂停",
            date: "2018-03-29",
            highlight: true,
        },
        {
            title: "#60 样品暂停及恢复",
            date: "2018-03-27",
            highlight: true,
        },
        {
            title: "#217 SampleService单元测试(部分)",
            date: "2018-03-21",
            highlight: true,
        },
        {
            title: "#212 重构会话服务",
            date: "2018-03-13",
            highlight: true,
        },
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
        //{
        //title: "#198(HOTFIX) 任务下达bug",
        //date: "2018-01-29",
        //highlight: true,
        //},
        //{
        //title: "#193 修复请求体过大导致的拒绝服务",
        //date: "2018-01-25",
        //highlight: true,
        //},
        //{
        //title: "#195 修复混样样品详单编号缺失bug",
        //date: "2018-01-25",
        //highlight: true,
        //},
        //{
        //title: "#194 Simple Table多列查询",
        //date: "2018-01-25",
        //highlight: true,
        //},
        //{
        //title: "#180 修复混合样品Index导出缺失Bug",
        //date: "2018-01-25",
        //highlight: true,
        //},
        //{
        //title: "#190 Simple Table性能优化",
        //date: "2018-01-24",
        //highlight: true,
        //},
        //{
        //title: "#183 绩效统计及建库液相数量统计",
        //date: "2018-01-17",
        //highlight: true,
        //},
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
            title: "#243 样品属性手动选择最优结果",
            date: "?",
        },
        {
            title: "",
            date: "",
        },
    ]
    constructor(
        public snackBar: MatSnackBar,
        private utilService: UtilService,
        private userInfoService: UserInfoService,
        private authService: AuthService,
        private spinnerService: SpinnerService,
        private entityService: EntityService,
        private router: Router,
        public logger: LogService,
    ) {}

    ngOnInit() {

        this.userInfo = this.userInfoService.getUserInfo()
        this.getParams()
        this.logger.clear()
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

    setCookie(name: string, value: string, remember: string, path: string = "") {
        let date = new Date()
        let minutes: number
        if (remember == "true") {
            minutes = 7200 // 5 * 24 * 60
        } else {
            minutes = 30
        }
        date.setTime(date.getTime() + minutes * 60 * 1000)
        let expires = "expires=" + date.toUTCString()
        document.cookie = name + "=" + value + "; " + expires + (path.length > 0 ? "; path=" + path : "")
        console.log("cookie", document.cookie)
    }

    refresh() {
        this.router.navigate(['/redirect' + this.router.url])
    }

    restore() {
        this.utilService.restoreDatabase()
            .subscribe(data => {}, err => {}, () => {
                this.refresh()
            })
    }

    onActivate(event: any) {
        this.showMessage = false
    }
    onDeactivate(event: any) {
        this.showMessage = true
    }

    getLocalStorage() {
        let tmp = this.logger.publishers.find(p => p.constructor.name === "LogLocalStorage")
        if (tmp != null) {
            let local = tmp as LogLocalStorage
            local.getAll().subscribe(res => this.logEntryList = res)
        }
    }

    downloadLog() {
        this.getLocalStorage()

        var blob = new Blob([JSON.stringify(this.logEntryList)], {type: 'application/json'})
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');

        let timestamp = new DatePipe('en-US').transform(new Date(), 'yyyyMMdd.HHmmss')
        anchor.download = 'log' + '.' + timestamp + '.json';
        anchor.href = url;
        anchor.click()
    }
}
