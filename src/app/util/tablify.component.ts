import {Component, Input, ViewChild, ElementRef} from '@angular/core'
import {MdPaginator} from '@angular/material'
import {MdSort} from '@angular/material'

import { DataSource } from '@angular/cdk';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map'

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

  constructor(){
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

  selectSample(sample: any){
    let id = sample.id
    let index = this.selectedSampleIdList.indexOf(id)

    if (index != -1) {
      this.selectedSampleIdList.splice(index, 1)
    } else {
      this.selectedSampleIdList.push(id)
    }
    console.log(this.selectedSampleIdList)
  }
  selectAllSamples(){
    if (!this.isSelectAll){
      this.selectedSampleIdList = []
      this.sampleDataSource.currentSampleList.forEach(sample => {
        this.selectedSampleIdList.push(sample.id)
        sample['TMP_CHECKED'] = true
      })
    } else {
      this.clearSelectedSamples()
    }
    console.log(this.selectedSampleIdList)
  }

  clearSelectedSamples(){
    this.selectedSampleIdList = []
    this.sampleDataSource.currentSampleList.forEach(sample => {
      sample['TMP_CHECKED'] = false
    })
  }

  expandSample(sample: any, hybridType: string){
    let hybridCode = sample['SYS_'+hybridType+'_CODE']
    console.log(hybridCode)
    console.log(">>", this.sampleDatabase.hybridMap[hybridType][hybridCode])
  }

}

export class SampleDatabase {
  rawSampleList: any[]
  hybridMap: any = {}
  constructor(private _rawSampleList: any[]){
    this.rawSampleList = _rawSampleList
    this.dataChange = new BehaviorSubject<any>([])
    const cd = this.data.slice()

    // Build sample list with only one sample for the same type of hybrid
    // and push all the inner samples to the corresponding collections.
    let runString = 'SYS_RUN_CODE'
    let lanString = 'SYS_LANE_CODE'
    let capString = 'SYS_CAPTURE_CODE'
    let sampleString = 'SAMPLES'
    this.hybridMap['RUN'] = {}
    this.hybridMap['LANE'] = {}
    this.hybridMap['CAPTURE'] = {}
    this.rawSampleList.forEach(sample => {
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
      if (!isNew){
        cd.push(sample)
        this.dataChange.next(cd)
      }
    })

  }

  sampleList: any[]
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

      return this.getSortedData(data)
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
