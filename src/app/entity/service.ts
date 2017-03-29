import {Injectable} from '@angular/core'
import {Http, Headers} from '@angular/http'
import 'rxjs/add/operator/map'

@Injectable()
export class EntityService {
  private url: string = 'http://dell:3000/entity'
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

  retrieveById(id: string){
    return this.http.get(`${this.url}/${id}`)
    .map(res => res.json())
  }

  retrieveByType(type: string){
    let url = `${this.url}?SYS_ENTITY_TYPE=${type}`
    return this.http.get(url)
    .map(res => res.json())
  }

  retrieveByGenre(genreIdentifier: string){
    let url = `${this.url}?SYS_GENRE_IDENTIFIER=${genreIdentifier}`
    return this.http.get(url)
    .map(res => res.json())
  }

  retrieveByIdentifier(identifier: string){
    let url = `${this.url}?where={"SYS_IDENTIFIER": {"regex":"${identifier}"}}`
    return this.http.get(url)
    .map(res => res.json())
  }





  retrieveByGenreCategory(category: string){
    let url = `${this.url}?genre=${category}`
    return this.http.get(url)
    .map(res => res.json())
  }

  // get entity by genre
  // note that the identifier of genre is the same as the identifier of
  // the entity. e.g., '/MATERIAL/ENZYME' is the identifier of genre,
  // and the entity enzyme
  retrieveSubEntity(identifier: string, subCategory: string){
    let url = `${this.url}?where={"identifier":{"contains":"${identifier}"}, "genre":"${subCategory}"}`
    return this.http.get(url)
    .map(res => res.json())
  }

  // get objects from given class identifer
  // in order to render the entity list when create entities.
  //
  // Note that it's critical to implement the BoM specification
  // For example, PM set the material collection, which identifier looks like
  // `/MATERIAL/ENZYME/KAPA`, then on the run time, the "contains" will return
  // objects exactly.
  retrieveEntityByGenreAndIdentifier(genre: string, identifier: string){
    let url = `${this.url}?where={"identifier":{"contains":"${identifier}"}, "genre":"${genre}"}`
    return this.http.get(url)
    .map(res => res.json())
  }
  //
  // get objects from given class identifer
  // in order to render the entity list when create entities.
  retrieveObjectsByIdentifier(identifier: string){
    let url = `${this.url}?where={"identifier":{"contains":"${identifier}"}, "genre":"object"}`
    return this.http.get(url)
    .map(res => res.json())
  }

  retrieveByGenre2(genrePrefix: string){
    //let url = `${this.url}?where={"genre":{"contains":"${genrePrefix}/"}}`
    let url = `${this.url}?genre=${genrePrefix}`
    return this.http.get(url)
    .map(res => res.json())
  }

  // used by Genre, to get entity which genre starts with
  // specific category, since there's not any category in 
  // entity attributes.
  retrieveByGenrePrefix(genrePrefix: string){
    let url = `${this.url}?where={"genre":{"contains":"${genrePrefix}/"}}`
    return this.http.get(url)
    .map(res => res.json())
  }

  retrieveById_depr(id: string){
    return this.http.get(`${this.url}/${id}`)
    .map(res => res.json())
  }

  // get class entity for objects entity when track children
  retrieveByIdentifier2(identifier: string){
    return this.http.get(`${this.url}?identifier=${identifier}`)
    .map(res => res.json())
  }

  retrieveByEntity(key: string, value: string){
    return this.http.get(`${this.url}?${key}=${value}`)
    .map(res => res.json())
  }

  // get entities by gener and identifier, e.g. get workcenters by 
  // genre="collection" and identifiel contains "/WORKFLOW"
  // e.g. get samples from /SAMPLE
  retrieveByGenreAndIdentifier(genre: string, identifier: string){
    return this.http.get(`${this.url}?where={"genre": "${genre}", "identifier":{"contains":"${identifier}"}}`)
    .map(res => res.json())
  }
}


