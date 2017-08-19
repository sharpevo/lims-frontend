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

	constructor(){
	}

	sampleDatabase: SampleDatabase// = new SampleDatabase(this.rawSampleList)
	sampleDataSource: SampleDataSource | null

	ngOnInit(){

    if (!this.columnList){
      // fix undefined bug
      this.columnList = ['id']
    } else {
      // convert object to map
      this.columnList.forEach(column => {
        let key = column['SYS_CODE']
        // get keys in a order
        this.columnMapKeys.push(key)
        this.columnMap[key] = {}
        this.columnMap[key]['SYS_LABEL']= column[column['SYS_LABEL']]
      })
    }

		this.sampleDatabase = new SampleDatabase(this.rawSampleList)
    this.sampleDataSource = new SampleDataSource(this.sampleDatabase, this.paginator, this.sort, this.columnMapKeys)
		Observable.fromEvent(this.filter.nativeElement, 'keyup')
		.debounceTime(150)
		.distinctUntilChanged()
		.subscribe(() => {
			if (!this.sampleDataSource) { return; }
			this.sampleDataSource.filter = this.filter.nativeElement.value;
		})
	}

}

//export interface SampleData {
//id: string
//sn: string
//}

export class SampleDatabase {
	rawSampleList: any[]
	constructor(private _rawSampleList: any[]){
		this.rawSampleList = _rawSampleList
		this.dataChange = new BehaviorSubject<any>([])
		const cd = this.data.slice()
		console.log("xx", this.data)
		this.rawSampleList.forEach(sample => {
			cd.push(sample)
			//this.sampleList.push(sample)
			this.dataChange.next(cd)
		})
		console.log("++", this.rawSampleList)
	}

	sampleList: any[]
	dataChange: BehaviorSubject<any>// = new BehaviorSubject([])
	get data(): any[] {
		//this.sampleList = this.rawSampleList
		//this.rawSampleList.forEach(sample => {
		//this.sampleList.push(sample)
		//this.dataChange.next(this.sampleList)
		//})
		//console.log("--", this.dataChange.value)
		//return this.sampleList
		return this.dataChange.value
	}


}

export class SampleDataSource extends DataSource<any> {

	dataLength: number = 0

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

			// fix length bug
			this.dataLength = data.length

			const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
			data = data.splice(startIndex, this._paginator.pageSize)
			return this.getSortedData(data)
		})
		//console.log(">", this._exampleDatabase.dataChange)
		//return this._exampleDatabase.dataChange;
	}
	disconnect() {}
	getSortedData(data: any[]): any[] {
		//console.log("s", this._sort)
		//const data = this._exampleDatabase.data.slice();
		//const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
		//const data = this._exampleDatabase.data.slice().splice(startIndex, this._paginator.pageSize)
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
