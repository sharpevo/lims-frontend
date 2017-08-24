import {Component, Input, ViewChild, ElementRef} from '@angular/core'
import {MdPaginator} from '@angular/material'
import {MdSort} from '@angular/material'

import { DataSource } from '@angular/cdk';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map'

import {SampleService} from '../models/sample'

@Component({
  selector: 'simple-table',
  styleUrls: ['./tablify.component.css'],
  templateUrl: './tablify.component.html'
})
export class TablifyComponent{

  @Input() rawSampleList
  @Input() columnList
  @ViewChild(MdPaginator) paginator: MdPaginator
  @ViewChild(MdSort) sort: MdSort
  @ViewChild('filter') filter: ElementRef

  columnMap: any = {}
  columnMapKeys: any[] = []

  selectedSampleIdList: any[] = []
  isSelectAll: boolean = false

  constructor(
    private sampleService: SampleService
  ){
  }

  sampleDatabase: SampleDatabase// = new SampleDatabase(this.rawSampleList)
  sampleDataSource: SampleDataSource | null

  ngOnInit(){

    if (!this.columnList){
      // fix undefined bug
      this.columnList = []
    }
    // Artificial column for checkbox
    this.columnList.unshift({
      "SYS_CODE": "id",
      "SYS_LABEL": " ",
      "SYS_TYPE": "checkbox",
    })

    // convert object to map
    this.columnList.forEach(column => {
      let key = column['SYS_CODE']
      // get keys in a order
      this.columnMapKeys.push(key)
      this.columnMap[key] = {}
      this.columnMap[key]['SYS_LABEL']= column[column['SYS_LABEL']]
      this.columnMap[key]['SYS_TYPE']= column['SYS_TYPE']
    })

    this.sampleDatabase = new SampleDatabase(this.rawSampleList)
    this.sampleDataSource = new SampleDataSource(this.sampleDatabase, this.paginator, this.sort, this.columnMapKeys)
    Observable.fromEvent(this.filter.nativeElement, 'keyup')
    .debounceTime(150)
    .distinctUntilChanged()
    .subscribe(() => {

      this.isSelectAll=false
      this.clearSelectedSamples()

      if (!this.sampleDataSource) { return; }
      this.sampleDataSource.filter = this.filter.nativeElement.value;
    })
  }

  selectSample(row: any){
    this.setSampleChecked(row, row['TMP_CHECKED'])
  }

  setSampleChecked(row: any, checked: boolean){
    //row['TMP_CHECKED'] = checked
    // Get samples for the selected hybrid sample

    if (row['TMP_TABLE_ITEM']){
      let hybridInfo = this.sampleService.getHybridInfo(row)
      let hybridType = hybridInfo['type']
      let hybridCode = hybridInfo['SYS_'+hybridType+'_CODE']

      this.sampleDatabase.hybridMap[hybridType][hybridCode].forEach(sample => {
        sample['TMP_CHECKED'] = checked

        let index = this.selectedSampleIdList.indexOf(sample.id)

        if (index != -1) {
          this.selectedSampleIdList.splice(index, 1)
        } else {
          this.selectedSampleIdList.push(sample.id)
        }

      })

    }

  }

  selectAllSamples(){
    console.log(this.isSelectAll)

    if (this.isSelectAll){
      this.selectedSampleIdList = []
      this.sampleDataSource.currentSampleList.forEach(sample => {
        sample['TMP_CHECKED'] = true
        this.setSampleChecked(sample, true)
      })
    } else {
      this.clearSelectedSamples()
    }
  }

  clearSelectedSamples(){
    this.selectedSampleIdList = []
    this.sampleDataSource.currentSampleList.forEach(sample => {
      sample['TMP_CHECKED'] = false
      this.setSampleChecked(sample, false)
    })
  }

  expandSample(sample: any, hybridType: string){
    this.sampleDatabase.rawSampleList.forEach(rawSample => {
      if (sample.SYS_SAMPLE_CODE == rawSample.SYS_SAMPLE_CODE) {
        rawSample['TMP_LIST_SAMPLE'] = !rawSample['TMP_LIST_SAMPLE']
      }
    })
    this.sampleDatabase.buildSampleList()
    this.sampleDataSource.filter = this.filter.nativeElement.value
  }
  //expandSample(sample: any, hybridType: string){
  //sample['TMP_LIST_SAMPLE'] = !sample['TMP_LIST_SAMPLE']
  //this.sampleDataSource.filter = this.filter.nativeElement.value
  //}

}

export class SampleDatabase {
  rawSampleList: any[]
  hybridMap: any = {}
  constructor(private _rawSampleList: any[]){
    this.rawSampleList = _rawSampleList
    //this.dataChange = new BehaviorSubject<any>([])
    this.buildSampleList()
  }

  // Build sample list with only one sample for the same type of hybrid
  // and push all the inner samples to the corresponding collections.
  buildSampleList(){

    // Fix duplicated samples
    this.dataChange = new BehaviorSubject<any>([])

    const cd = this.data.slice()
    let runString = 'SYS_RUN_CODE'
    let lanString = 'SYS_LANE_CODE'
    let capString = 'SYS_CAPTURE_CODE'
    let sampleString = 'SAMPLES'
    this.hybridMap['RUN'] = {}
    this.hybridMap['LANE'] = {}
    this.hybridMap['CAPTURE'] = {}
    this.rawSampleList.forEach(sample => {
      //console.log("sample:", sample)
      sample['TMP_TABLE_ITEM'] = false
      let isNew = false
      let runCode = sample[runString]
      let lanCode = sample[lanString]
      let capCode = sample[capString]
      if (runCode) {
        if (!this.hybridMap['RUN'][runCode]){
          isNew = true
          this.hybridMap['RUN'][runCode] = []
        }
        this.hybridMap['RUN'][runCode].push(sample)
      }
      if (lanCode) {
        if (!this.hybridMap['LANE'][lanCode]){
          isNew = true
          this.hybridMap['LANE'][lanCode] = []
        }
        this.hybridMap['LANE'][lanCode].push(sample)
      }
      if (capCode) {
        if (!this.hybridMap['CAPTURE'][capCode]){
          isNew = true
          this.hybridMap['CAPTURE'][capCode] = []
        }
        this.hybridMap['CAPTURE'][capCode].push(sample)
      }

      // New hybrid samples or pure samples
      if (!isNew || (!runCode && !lanCode && !capCode)){
        cd.push(sample)
        this.dataChange.next(cd)
      }
    })
  }

  dataChange: BehaviorSubject<any>// = new BehaviorSubject([])
  get data(): any[] {
    return this.dataChange.value
  }

}

export class SampleDataSource extends DataSource<any> {

  dataLength: number = 0
  currentSampleList: any[] = []

  _filterChange = new BehaviorSubject('');
  get filter(): string { return this._filterChange.value; }
  set filter(filter: string) { this._filterChange.next(filter); }

  constructor(
    private _exampleDatabase: SampleDatabase,
    private _paginator: MdPaginator,
    private _sort: MdSort,
    private itemKeys: any[],
  ) {
    super();
  }
  connect(): Observable<any[]> {
    const displayDataChanges = [
      this._exampleDatabase.dataChange,
      this._paginator.page,
      this._sort.mdSortChange,
      this._filterChange,
    ]

    this.dataLength = this._exampleDatabase.data.length

    return Observable.merge(...displayDataChanges).map(() => {
      let data = this._exampleDatabase.data.slice().filter((item) => {
        let keyStr = ""
        this.itemKeys.forEach(key => {
          keyStr += item[key]
        })
        let searchStr = keyStr.toLowerCase()
        //let searchStr = (item.id + item.SYS_CODE).toLowerCase();
        return searchStr.indexOf(this.filter.toLowerCase()) != -1;
      })

      // currentSampleList should be executed before pagination
      // in order to select all the samples under the specific filter.
      this.currentSampleList = data.slice()

      // fix length bug
      this.dataLength = data.length

      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      data = data.splice(startIndex, this._paginator.pageSize)
      data = this.getSortedData(data)
      let result = []
      let hybridMap = this._exampleDatabase.hybridMap
      data.forEach((item, index) => {
        //console.log("processing:", item.SYS_SAMPLE_CODE, item)
        let sample = Object.assign({}, item)
        sample['TMP_TABLE_ITEM'] = true
        result.push(sample)

        // Get the hybrid type
        let hybridType = ""
        let hybridCode = ""
        if (sample['SYS_RUN_CODE']) {
          hybridType = "RUN"
        } else if (sample['SYS_LANE_CODE']) {
          hybridType = "LANE"
        } else if (sample['SYS_CAPTURE_CODE']){
          hybridType = "CAPTURE"
        }
        //console.log(hybridMap[hybridType]['SYS_'+hybridType+'_CODE'])
        //console.log(hybridMap)
        if (sample['TMP_LIST_SAMPLE']){
          result = result.concat(hybridMap[hybridType][sample['SYS_'+hybridType+'_CODE']])
        }
      })
      //console.log("d:", data)
      //console.log("r:", result)

      return result
    })
  }
  disconnect() {}
  getSortedData(data: any[]): any[] {
    if (!this._sort.active || this._sort.direction == '') { return data; }

    data = data.sort((a, b) => {
      let propertyA: number|string = '';
      let propertyB: number|string = '';

      switch (this._sort.active) {
        case 'userId': [propertyA, propertyB] = [a.id, b.id]; break;
        case 'userName': [propertyA, propertyB] = [a.name, b.name]; break;
        case 'progress': [propertyA, propertyB] = [a.progress, b.progress]; break;
        case 'color': [propertyA, propertyB] = [a.color, b.color]; break;
      }

      let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction == 'asc' ? 1 : -1);
    });
    return data
  }
}
