import { Component } from '@angular/core';
import {EntityService} from './entity/service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  serviceList: any[] = []

  constructor(
    private entityService: EntityService
  ){}

  ngOnInit(){
    this.getServiceList()
  }
  getServiceList(){
    this.entityService.retrieveByType("domain")
    .subscribe(
      data => {
        this.serviceList = data
      }
    )
  }
}
