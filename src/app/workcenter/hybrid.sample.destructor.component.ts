import {Component, Input} from '@angular/core'

@Component({
  selector: 'hybrid-sample-destructor',
  templateUrl: './hybrid.sample.destructor.component.html',
})

export class HybridSampleDestructorComponent {
  @Input() hybridSample
  showElement: boolean = false
  constructor(){
  }

  ngOnInit(){
    console.log(this.hybridSample)
  }

}
