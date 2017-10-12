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
    this.getProductWorkcenterList()
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

  getProductWorkcenterList(){
    this.entityService.retrieveBy({
      "SYS_IDENTIFIER":"/PRODUCT_WORKCENTER",
    }).subscribe(data => {
      this.entityService.retrieveEntity(data[0].id, "class")
      .subscribe(data => {
        data.forEach(workcenter => {
          this.appList.push({
            "label":workcenter[workcenter['SYS_LABEL']],
            "url":"/entity/" + workcenter.id,
            "icon": "",
          })
        })
      })
    })
  }
}
