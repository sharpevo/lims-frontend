import {Injectable} from '@angular/core'
import {Http, Headers} from '@angular/http'
import 'rxjs/add/operator/map'

@Injectable()
export class AttributeService {
  private url: string = 'http://dell:3000/attribute'
  private headers: Headers
  constructor(private http: Http){
    this.headers = new Headers()
    this.headers.append('Content-Type', 'application/json')
    this.headers.append('Accept', 'application/json')
  }

  create(object: any){
    return this.http.post(
      this.url,
      JSON.stringify(object),
      {headers: this.headers})
      .map(res => res.json())
  }

  deleteById(id: string){
    return this.http.delete(`${this.url}/${id}`)
    .map(res => res.json())
  }

  retrieve(){
    return this.http.get(this.url)
    .map(res => res.json())
  }

  retrieveByGenreId(id: string){
    return this.http.get(`${this.url}?genre=${id}`)
    .map(res => res.json())
  }

  // retrieve attributes associated with specific entity (class)
  retrieveByTypeEntity(type: string, id: string){
    return this.http.get(`${this.url}?type=${type}&typeEntityId=${id}`)
    .map(res => res.json())
  }
}


