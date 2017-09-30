import {Component, Input, ViewChild, ElementRef} from '@angular/core'
import {MdPaginator} from '@angular/material'
import {MdSort} from '@angular/material'
import {MdDialog, MdDialogRef} from '@angular/material'

import { DataSource } from '@angular/cdk';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map'

import {SampleService} from '../models/sample'
import {SimpleTableDialog} from './simple.table.dialog'

@Component({
  selector: 'simple-table',
  styleUrls: ['./tablify.component.css'],
  templateUrl: './tablify.component.html'
})
export class TablifyComponent{

  @Input() rawSampleList
  @Input() shownSampleList
  @Input() columnList
  @Input() targetHybridType
  @Input() hybridObjectMap
  @ViewChild(MdPaginator) paginator: MdPaginator
  @ViewChild(MdSort) sort: MdSort
  @ViewChild('filter') filter: ElementRef

  columnMap: any = {}
  columnMapKeys: any[] = []

  selectedSampleIdList: any[] = []
  isSelectAll: boolean = false

  constructor(
    public dialog: MdDialog,
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

    let hasSampleCode = false
    this.columnList.forEach(column => {
      if (column['SYS_CODE'] == 'SYS_SAMPLE_CODE'){
        hasSampleCode = true
      }
    })
    if (!hasSampleCode){
      this.columnList.unshift({
        "SYS_CODE": "SYS_SAMPLE_CODE",
        "SYS_LABEL": "样品编码",
        "SYS_TYPE": "string",
      })
    }

    if (!this.columnList[0] ||
        this.columnList[0].SYS_TYPE != "checkbox"){
      // Artificial column for checkbox
      this.columnList.unshift({
        "SYS_CODE": "id",
        "SYS_LABEL": " ",
        "SYS_TYPE": "checkbox",
      })
    }

    // convert object to map
    this.columnList.forEach(column => {
      let key = column['SYS_CODE']
      // get keys in a order
      this.columnMapKeys.push(key)
      this.columnMap[key] = {}

      // the choices are useful for the attributes retrieved from the
      // SYS_SCHEMA instead of the attribute list.
      this.columnMap[key]['SYS_LABEL']= column[column['SYS_LABEL']]?column[column['SYS_LABEL']]:column['SYS_LABEL']
      this.columnMap[key]['SYS_TYPE']= column['SYS_TYPE']
    })

    this.sampleDatabase = new SampleDatabase(this.shownSampleList, this.targetHybridType)
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

  // Normally, the operatable samples might be the processing stage meaning the
  // value of checkboxes should be treated with the current sample id instead
  // of the previous one as default.
  checkCurrentSample(sample: any, checked: boolean){
    let currentSampleIndex = sample['TMP_NEXT_SAMPLE_INDEX']
    if (currentSampleIndex >= 0){
      console.log("C", sample.id)
      this.rawSampleList[currentSampleIndex]['TMP_CHECKED'] = checked
      this.rawSampleList[currentSampleIndex]['SYS_HYBRID_INFO'] = sample['SYS_HYBRID_INFO']
    } else {
      console.warn("Not valid next sample id.")
    }
  }

  setSampleChecked(row: any, checked: boolean){
    if (row['TMP_TABLE_ITEM']){
      // hybrid sample checking
      let hybridInfo = this.sampleService.getHybridInfo(row)
      if (!hybridInfo){
        this.checkCurrentSample(row, checked)
      } else {
        let hybridType = hybridInfo['type']
        let hybridCode = hybridInfo['SYS_'+hybridType+'_CODE']

        if (this.sampleDatabase.hybridMap[hybridType][hybridCode]){
          this.sampleDatabase.hybridMap[hybridType][hybridCode].forEach(sample => {
            sample['TMP_CHECKED'] = checked
            this.checkCurrentSample(sample, checked)
            let index = this.selectedSampleIdList.indexOf(sample.id)
            if (index != -1 && !checked) {
              this.selectedSampleIdList.splice(index, 1)
            }
            if (index == -1 && checked){
              this.selectedSampleIdList.push(sample.id)
            }
          })
        }
      }
    } else {
      // internal sample checking
      this.checkCurrentSample(row, checked)
      let index = this.selectedSampleIdList.indexOf(row.id)
      if (index != -1) {
        this.selectedSampleIdList.splice(index, 1)
      } else {
        this.selectedSampleIdList.push(row.id)
      }
    }
  }


  selectAllSamples(){
    this.sampleDataSource.changePageSize(this.sampleDataSource.currentSampleList.length)
    this.sampleDataSource.filter = this.filter.nativeElement.value
    if (this.isSelectAll){
      this.selectedSampleIdList = []
      this.sampleDataSource.currentSampleList.forEach(sample => {
        sample['TMP_CHECKED'] = true
        this.setSampleChecked(sample, true)
      })
    } else {
      this.sampleDataSource.currentSampleList.forEach(sample => {
        sample['TMP_CHECKED'] = false
        this.checkCurrentSample(sample, false)
      })
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

  openInternalSampleDialog(sample: any){
    console.log(sample)
    let hybridType = sample['TMP_HYBRID_TYPE']
    let hybridCode = sample['SYS_'+hybridType+'_CODE']
    let dialogRef = this.dialog.open(SimpleTableDialog, {height: '500px', width: '800px'});
    dialogRef.componentInstance.config.sampleList = this.sampleDatabase.hybridMap[hybridType][hybridCode]
    dialogRef.componentInstance.config.hybridType = hybridType
    dialogRef.componentInstance.config.hybridCode = hybridCode
    dialogRef.afterClosed().subscribe(result => {
      //
    });
  }

}

export class SampleDatabase {
  rawSampleList: any[]
  hybridMap: any = {}
  constructor(
    private _rawSampleList: any[],
    private targetHybridType: string
  ){
    this.rawSampleList = _rawSampleList
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
    this.hybridMap['SAMPLE'] = {}
    this.rawSampleList.forEach(rawSample => {
      let sample = Object.assign({}, rawSample)
      let isHybrid = false
      let runCode = sample[runString]
      let lanCode = sample[lanString]
      let capCode = sample[capString]


      if (!this.targetHybridType){
        if (runCode) {
          if (!this.hybridMap['RUN'][runCode]){
            isHybrid = true
            this.hybridMap['RUN'][runCode] = []
          }
          sample['TMP_HYBRID_TYPE'] = 'RUN'
          this.hybridMap['RUN'][runCode].push(rawSample)
        }
        if (!runCode && lanCode) {
          if (!this.hybridMap['LANE'][lanCode]){
            isHybrid = true
            this.hybridMap['LANE'][lanCode] = []
          }
          sample['TMP_HYBRID_TYPE'] = 'LANE'
          this.hybridMap['LANE'][lanCode].push(rawSample)
        }
        if (!runCode && !lanCode && capCode) {
          if (!this.hybridMap['CAPTURE'][capCode]){
            isHybrid = true
            this.hybridMap['CAPTURE'][capCode] = []
          }
          sample['TMP_HYBRID_TYPE'] = 'CAPTURE'
          this.hybridMap['CAPTURE'][capCode].push(rawSample)
        }

        sample['TMP_TABLE_ITEM'] = isHybrid || (!runCode && !lanCode && !capCode)

        // New hybrid samples or pure samples
        if (isHybrid || (!runCode && !lanCode && !capCode)){
          cd.push(sample)
          this.dataChange.next(cd)
        }
      } else {

        let hybridCode = sample['SYS_'+this.targetHybridType+'_CODE']

        if (!this.hybridMap[this.targetHybridType][hybridCode]){
          isHybrid = true
          this.hybridMap[this.targetHybridType][hybridCode] = []
        }
        this.hybridMap[this.targetHybridType][hybridCode].push(rawSample)
        sample['TMP_HYBRID_TYPE'] = this.targetHybridType

        sample['TMP_TABLE_ITEM'] = isHybrid
        // New hybrid samples or pure samples
        if (isHybrid || (!runCode && !lanCode && !capCode)){
          cd.push(sample)
          this.dataChange.next(cd)
        }
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

  changePageSize(pageSize: number){
    console.log("change page size", this._paginator.pageSize, pageSize)
    this._paginator.pageSize = pageSize
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
      data.forEach((sample, index) => {
        result.push(sample)

        //// Get the hybrid type
        //let hybridType = ""
        //let hybridCode = ""
        //if (sample['SYS_RUN_CODE']) {
        //hybridType = "RUN"
        //} else if (sample['SYS_LANE_CODE']) {
        //hybridType = "LANE"
        //} else if (sample['SYS_CAPTURE_CODE']){
        //hybridType = "CAPTURE"
        //}
        //if (sample['TMP_LIST_SAMPLE']){
        //result = result.concat(hybridMap[hybridType][sample['SYS_'+hybridType+'_CODE']])
        //}
      })

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
