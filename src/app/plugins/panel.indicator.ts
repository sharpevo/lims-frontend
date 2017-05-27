import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {SampleService} from '../models/sample'

@Component({
  selector: 'plugin-panel-indicator',
  templateUrl: './panel.indicator.html',
})
export class PluginPanelIndicatorComponent {
  @Input('sample') sample
  targetObject: any = {}

  constructor(
    private entityService: EntityService,
    private sampleService: SampleService,
  ) {}

  ngOnInit(){
    if (this.sample){
      this.getIndex()
    } else{
      console.log("Invalid sample")
    }
  }

  getIndex(){
    let targetId = this.sampleService.retrieveRootTarget(this.sample['SYS_TARGET'])
    if (!targetId) {
      console.log("only one SYS_TARGET")
      targetId = this.sample['SYS_TARGET']
    }

    this.entityService.retrieveBy({'_id': targetId})
    .subscribe(data => {
      this.targetObject = data[0]
    })

  }

}
