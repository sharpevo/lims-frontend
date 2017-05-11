import {Component, Input} from '@angular/core'

@Component({
  selector: 'hybrid-sample-destructor',
  templateUrl: './hybrid.sample.destructor.component.html',
})

export class HybridSampleDestructorComponent {
  @Input() hybridSample
  showElement: boolean = false
  hybridSampleChecked: boolean = false
  maxLoop: number = 5
  sampleList: any[]
  constructor(){
  }

  ngOnInit(){
  }

  getSampleList(hybridSample: any){
    if (this.maxLoop < 0) {
      console.log("not valid samples")
      return
    }
    let keys = Object.keys(hybridSample)
    console.log(this.maxLoop)
    if (keys[0] != 'SAMPLES'){
      this.maxLoop -= 1
      keys.forEach(key => {
        this.getSampleList(hybridSample[key])
      })
    } else {
      this.maxLoop = 5
      this.sampleList = hybridSample['SAMPLES']
    }
  }

  checkSample(){
    this.getSampleList(this.hybridSample)
    this.sampleList.forEach(sample => {
      sample['TMP_CHECKED'] = !this.hybridSampleChecked
    })

  }
}
