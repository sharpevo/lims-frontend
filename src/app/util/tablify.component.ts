import {Component, Input} from '@angular/core'

import { DataSource } from '@angular/cdk';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map'

@Component({
	selector: 'simple-table',
	templateUrl: './tablify.component.html'
})
export class TablifyComponent{

	@Input() rawSampleList

	displayedColumns = ['id', 'sn']
	sampleDatabase = new SampleDatabase(this.rawSampleList)
	sampleDataSource: SampleDataSource | null

	ngOnInit(){
		this.sampleDataSource = new SampleDataSource(this.sampleDatabase)
		console.log(this.sampleDataSource)
	}

}

export interface SampleData {
	id: string
	sn: string
}

export class SampleDatabase {
	rawSampleList: any[]

	sampleList: SampleData[]
	dataChange: BehaviorSubject<SampleData[]> = new BehaviorSubject<SampleData[]>([])
	get data(): SampleData[] {
		this.sampleList = this.rawSampleList
		return this.sampleList
	}

	constructor(private _rawSampleList: any[]){
		this.rawSampleList = _rawSampleList
	}

}

export class SampleDataSource extends DataSource<any> {
	constructor(private _exampleDatabase: SampleDatabase) {
		super();
	}
	/** Connect function called by the table to retrieve one stream containing the data to render. */
	connect(): Observable<SampleData[]> {
		console.log('ExampleDataSource#connect')
		return this._exampleDatabase.dataChange;
	}
	disconnect() {}
}
