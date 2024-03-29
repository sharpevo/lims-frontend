import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {Observable} from 'rxjs/Observable'
import {SampleService} from '../models/sample'


@Component({
    selector: 'workcenter-sample-completed',
    templateUrl: './sample.completed.component.html',
})
export class WorkcenterSampleCompletedComponent{
    @Input() sampleList
    @Input() callback
    @Input() workcenter

    completedSampleList: any[] = []

    constructor(
        private entityService: EntityService,
        private sampleService: SampleService,
    ){}

    ngOnInit(){
        this.getSampleList()
    }

    getSampleList(){

        this.completedSampleList = []
        if (!this.sampleList){
            return
        }
        this.sampleList.forEach(sample => {
            if (sample['SYS_DATE_COMPLETED'] &&
                !sample['SYS_DATE_TERMINATED']) {
                this.completedSampleList.push(sample)
            }
        })
    }
}
