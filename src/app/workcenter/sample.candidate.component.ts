import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'

@Component({
  selector: 'workcenter-sample-candidate',
  templateUrl: './sample.candidate.component.html',
})
export class WorkcenterSampleCandidateComponent{
  @Input() workcenter

  constructor(){}

  ngOnInit(){}

}
