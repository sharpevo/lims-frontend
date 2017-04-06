import { PipeTransform, Pipe } from '@angular/core';

@Pipe({name: 'objectKeys'})
export class ObjectKeysPipe implements PipeTransform {
  transform(value: any, args:string[]) : any {
    if (!value) return value
      console.log(value)
    for (let key in value){console.log(key)}
    return Object.keys(value)
  }
}

