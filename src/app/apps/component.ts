import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {UserService} from '../util/user.service'

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
  ){}

  ngOnInit(){
    this.userInfo = this.userService.getUserInfo()
    this.getWorkcenterList("/PRODUCT_WORKCENTER")
    //this.getWorkcenterList("/PROJECT_MANAGEMENT")
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
}