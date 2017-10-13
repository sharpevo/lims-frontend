import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'

@Component({
  selector: 'apps-view',
  templateUrl: './component.html',
  styleUrls: ['./component.css'],
})

export class AppsComponent {
  appList = []
  gridCols: number = 5

  constructor(
    private entityService: EntityService,
  ){}

  ngOnInit(){
    this.getWorkcenterList("/PRODUCT_WORKCENTER")
    //this.getWorkcenterList("/PROJECT_MANAGEMENT")
    this.appList.push({
      "label": "样品管理",
      "url":"http://192.168.1.90:8080",
      "icon":"primary",
    })
    this.appList.push({
      "label": "客户管理",
      "url":"http://192.168.1.90:8080",
      "icon":"primary",
    })
    this.appList.push({
      "label": "任务下达*",
      "url":"/project-management",
      "icon":"accent",
    })
    this.appList.push({
      "label": "项目进度*",
      "url":"/apps",
      "icon":"accent",
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
        data.forEach(workcenter => {
          this.appList.push({
            "label":workcenter[workcenter['SYS_LABEL']],
            "url":"/workcenter-dashboard/" + workcenter.id,
            "icon": "warn",
          })
        })
      })
    })
  }
}
