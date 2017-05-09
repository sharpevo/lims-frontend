import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {Observable} from 'rxjs/Observable'

@Component({
  selector: 'workcenter-sample-completed',
  templateUrl: './sample.completed.component.html',
})
export class WorkcenterSampleCompletedComponent{
  @Input() sampleList
  @Input() callback

  completedSampleList: any[] = []

  constructor(
    private entityService: EntityService,
  ){}

  ngOnInit(){
    this.getSampleList()
  }

  getSampleList(){

    this.completedSampleList = []
    if (!this.sampleList){
      return
    }

    let chainedSampleObs = []

    this.sampleList.forEach(d => {
      chainedSampleObs.push(
        this.entityService.retrieveBy({
          'SYS_TARGET': d['SYS_TARGET'],
          'sort': 'SYS_ORDER'})
      )
    })

    Observable
    .forkJoin(chainedSampleObs)
    .subscribe((data: any[][]) => {

      for (let i=0; i<data.length; i++){
        let currentSample = this.sampleList[i]

        if (currentSample['SYS_DATE_COMPLETED'] &&
            !currentSample['SYS_DATE_TERMINATED']) {
          this.completedSampleList.push(currentSample)
        }
      }

    })


  }

}
