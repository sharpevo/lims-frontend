import { PipeTransform, Pipe } from '@angular/core';

@Pipe({name: 'objectKeys'})
export class ObjectKeysPipe implements PipeTransform {
	transform(value: any, args:string[]) : any {
		if (!value) return value
			return Object.keys(value)
	}
}

