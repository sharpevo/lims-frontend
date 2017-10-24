import { Component } from '@angular/core';
import {EntityService} from './entity/service'
import {environment} from '../environments/environment'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  serviceList: any[] = []
  environment = environment

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

  setLanguage(language: string) {
    localStorage.setItem('locale', language)
    location.reload(true)
  }
}
