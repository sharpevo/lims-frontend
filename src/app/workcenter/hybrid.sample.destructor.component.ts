import {Component, Input} from '@angular/core'

@Component({
  selector: 'hybrid-sample-destructor',
  templateUrl: './hybrid.sample.destructor.component.html',
})

export class HybridSampleDestructorComponent {
  @Input() hybridSampleList
  @Input() shownSampleList
  @Input() showCheckbox
  @Input() expandall
  @Input() workcenter
  item: any = {}
  maxLoop: number = 5
  sampleList: any[]
  constructor(){
  }

  ngOnInit(){
    if (!this.shownSampleList) {
      this.shownSampleList = this.hybridSampleList
    }
  }

  getSampleList(hybridSample: any){
    if (this.maxLoop < 0) {
      console.log("not valid samples")
      return
    }
    let keys = Object.keys(hybridSample)
    if (keys[0] != 'SAMPLES'){
      this.maxLoop -= 1
      keys.forEach(key => {
        this.getSampleList(hybridSample[key])
      })
    } else {
      this.maxLoop = 5
      this.sampleList = this.sampleList.concat(hybridSample['SAMPLES'])
    }
  }

  checkSample(itemKey: string){
    this.sampleList = []
    this.getSampleList(this.shownSampleList[itemKey])
    this.sampleList.forEach(sample => {
      if (sample['TMP_NEXT_SAMPLE_INDEX'] >= 0){
        this.hybridSampleList[sample['TMP_NEXT_SAMPLE_INDEX']]['TMP_CHECKED'] = !this.item[itemKey+'_TMP_CHECKED']
      } else {
        sample['TMP_CHECKED'] = !this.item[itemKey+'_TMP_CHECKED']
      }
    })
  }
}
