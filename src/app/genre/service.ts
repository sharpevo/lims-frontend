import {Injectable} from '@angular/core'
import {Http, Headers} from '@angular/http'
import 'rxjs/add/operator/map'

@Injectable()
export class GenreService {
  private url: string = 'http://dell:3000/genre'
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

  update(object: any){
    return this.http.put(
      `${this.url}/${object.id}`,
      JSON.stringify(object),
      {headers: this.headers})
      .map(res => res.json())
  }

  addAttribute(objectid: string, attributeid: string){
    return this.http.post(
      `${this.url}/${objectid}/attributes/${attributeid}`,
      '',
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

  retrieveBy(args: any){
    let argString = ''
    Object.keys(args).forEach(key => {
      if (argString != '') {
        argString += `&${key}=${args[key]}`
      } else {
        argString += `${key}=${args[key]}`
      }
    })
    return this.http.get(`${this.url}?${argString}`)
    .map(res => res.json())
  }

  retrieveByEntityId(entityId: string){
    return this.http.get(`${this.url}?SYS_ENTITY=${entityId}`)
    .map(res => res.json())
  }

  retrieveAttribute(genreId: string){
    return this.http.get(`${this.url}/${genreId}/attribute`)
    .map(res => res.json())
  }

  retrieveEntity(genreId: string){
    return this.http.get(`${this.url}/${genreId}/entity`)
    .map(res => res.json())
  }

  retrieveByIdentifierPrefix(identifier: string){
    let url = `${this.url}?where={"SYS_IDENTIFIER":{"regex":"^${identifier}[A-Za-z0-9_.]%2B/$"}}`
    return this.http.get(url)
    .map(res => res.json())

  }




  retrieveByIdentifier(identifier: string){
    return this.http.get(`${this.url}?SYS_IDENTIFIER=${identifier}`)
    .map(res => res.json())
  }

  retrieveByEntityCode(code: string){
    let url = `${this.url}?where={"entitycode":{"contains":"${code}"}}`
    return this.http.get(url)
    .map(res => res.json())
  }

  retrieveByCategory(category: string){
    return this.http.get(`${this.url}?category=${category}`)
    .map(res => res.json())
  }

  // used in entity creating page
  retrieveByIdentifier2(identifier: string){
    return this.http.get(`${this.url}?identifier=${identifier}`)
    .map(res => res.json())
  }

  // used in render object form, e.g., manufacturing
  retrieveByObjectIdentifier(objectIdentifier: string){
    let genreIdentifier = objectIdentifier.substr(0, objectIdentifier.lastIndexOf("/")+1)
    //console.log(genreIdentifier)
    return this.retrieveByIdentifier(genreIdentifier)
  }

  retrieveById(id: string){
    return this.http.get(`${this.url}/${id}`)
    .map(res => res.json())
  }

}



