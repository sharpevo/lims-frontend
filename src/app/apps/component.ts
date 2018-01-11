import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {UserService} from '../util/user.service'
import {Router} from '@angular/router'
import {Observable} from 'rxjs/Rx'

@Component({
  selector: 'apps-view',
  templateUrl: './component.html',
  styleUrls: ['./component.css'],
})

export class AppsComponent {
  appList = []
  gridCols: number = 5
  userInfo: any

  constructor(
    private entityService: EntityService,
    private userService: UserService,
    private router: Router,
  ){}

  ngOnInit(){
    this.userInfo = this.userService.getUserInfo()
    this.getWorkcenterList("/PRODUCT_WORKCENTER")
    //this.getWorkcenterList("/PROJECT_MANAGEMENT")
    //this.appList.push({
    //"isInternal": false,
    //"label": "样品管理",
    //"url":"192.168.1.90:8085",
    //"icon":"extension",
    //})
    //this.appList.push({
    //"isInternal": false,
    //"label": "客户管理",
    //"url":"192.168.1.90:8088",
    //"icon":"extension",
    //})
    this.appList.push({
      "isInternal": true,
      "label": "任务下达*",
      "url":"/project-management",
      "icon":"extension",
    })
    this.appList.push({
      "isInternal": true,
      "label": "工作中心",
      "url":"/workcenter-overview",
      "icon":"extension",
    })
    this.appList.push({
      "isInternal": true,
      "label": "物料",
      "url":"/material-overview",
      "icon":"extension",
    })
    this.appList.push({
      "isInternal": true,
      "label": "配置",
      "url":"/tree",
      "icon":"settings",
    })
  }

  onSizeChanged(event){
    let innerWidth = event.target.innerWidth

    if (innerWidth > 1300) {
      this.gridCols = 7;
    }

    if (innerWidth < 1300 ) {
      this.gridCols = 5;
    }
    if (innerWidth < 1300 ) {
      this.gridCols = 5;
    }

    if (innerWidth < 1000) {
      this.gridCols = 3;
    }


    if (innerWidth < 700) {
      this.gridCols = 2;
    }

    if (innerWidth < 400) {
      this.gridCols = 1;
    }
  }

  getWorkcenterList(workcenterIdentifier: string){
    this.entityService.retrieveBy({
      "SYS_IDENTIFIER": workcenterIdentifier,
    }).subscribe(data => {
      this.entityService.retrieveEntity(data[0].id, "class")
      .subscribe(data => {
        let workcenterList = []
        let sampleCountList = []
        let countSampleObs = []
        data
        .sort((a,b) => {
          if (a.SYS_ORDER > b.SYS_ORDER) {
            return 1
          } else {
            return -1
          }
        })
        .forEach(workcenter => {
          workcenterList.push(workcenter)
          countSampleObs.push(
            this.entityService.retrieveEntity(workcenter.id, "collection")
          )
        })

        Observable.concat(...countSampleObs)
        .subscribe((data: any[]) => {

          let count = 0
          data.forEach(currentSample => {
            if (currentSample.hasOwnProperty('SYS_WORKCENTER_OPERATOR') &&
                !currentSample['SYS_DATE_TERMINATED'] &&
                  !currentSample['SYS_DATE_COMPLETED']) {
              count += 1
            }
          })
          sampleCountList.push(count)

        },
        err => {},
          () => {
          workcenterList.forEach((workcenter, index) => {
            //if (this.userService.hasRole("lims-workcenter-" + workcenter['SYS_CODE'].toLowerCase())) {
            this.appList.push({
              "isInternal": true,
              "label":workcenter[workcenter['SYS_LABEL']],
              "url":"/workcenter-dashboard/" + workcenter.id,
              "icon": "format_color_fill",
              "sampleCount": sampleCountList[index],
            })
            //}
          })

        })


      })
    })
  }

  getWorkcenterList2(workcenterIdentifier: string){
    this.entityService.retrieveBy({
      "SYS_IDENTIFIER":workcenterIdentifier,
    }).subscribe(data => {
      this.entityService.retrieveEntity(data[0].id, "class")
      .subscribe(data => {
        data
        .sort((a,b) => {
          if (a.SYS_ORDER > b.SYS_ORDER) {
            return 1
          } else {
            return -1
          }
        })
        .forEach(workcenter => {
          if (this.userService.hasRole("lims-workcenter-" + workcenter['SYS_CODE'].toLowerCase())) {
            this.appList.push({
              "isInternal": true,
              "label":workcenter[workcenter['SYS_LABEL']],
              "url":"/workcenter-dashboard/" + workcenter.id,
              "icon": "format_color_fill",
            })

          }

        })
      })
    })
  }

  navigateTo(app: any){
    if (app.isInternal){
      this.router.navigate([app.url])
    } else {
      window.location.href = `http://${app.url}`
    }
  }
}
