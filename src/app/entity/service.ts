import {Injectable} from '@angular/core'
import {Http, Headers} from '@angular/http'
import {CustomHttpService} from '../util/custom.http.service'
import {environment} from '../../environments/environment'
import 'rxjs/add/operator/map'

@Injectable()
export class EntityService {
  private url: string = '/entity'
  private headers: Headers
  constructor(
    private http: CustomHttpService
  ){
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

  retrieveBySortBy(args: any, sort: string){
    let argString = ''
    Object.keys(args).forEach(key => {
      if (argString != '') {
        argString += `&${key}=${args[key]}`
      } else {
        argString += `${key}=${args[key]}`
      }
    })
    return this.http.get(`${this.url}?${argString}&sort=${sort}`)
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

  retrieveGenre(entityId: string){
    return this.http.get(`${this.url}/${entityId}/genre`)
    .map(res => res.json())
  }

  retrieveAttribute(entityId: string){
    //console.log(`${this.url}/${entityId}/attribute`)
    return this.http.get(`${this.url}/${entityId}/attribute`)
    .map(res => res.json())
  }

  retrieveEntity(entityId: string, entityType: string, option?: string){
    //console.log(entityType)
    if (!entityType) {
      entityType = "object"
    }
    //console.log(`${this.url}/${entityId}/entity`)
    //return this.http.get(`${this.url}/${entityId}/entity`)
    let url = `${this.url}/${entityId}/entity?SYS_ENTITY_TYPE=${entityType}${option?option:''}`
    //console.log('retrieveEntity:', url)
    return this.http.get(url)
    .map(res => res.json())
  }

  retrieveChainedSamples(targetId: string){
    let url = `${this.url}?SYS_TARGET=${targetId}&sort=SYS_ORDER`
    return this.http.get(url)
    .map(res => res.json())
  }





  retrieveByGenre(genreIdentifier: string){
    let url = `${this.url}?SYS_GENRE_IDENTIFIER=${genreIdentifier}`
    return this.http.get(url)
    .map(res => res.json())
  }

  retrieveByIdentifier(identifier: string){
    let url = `${this.url}?where={"SYS_IDENTIFIER": {"regex":"${identifier}"}}&sort=-createdAt`
    return this.http.get(url)
    .map(res => res.json())
  }

  retrieveByIdentifierAndCategory(identifier: string, category: string){
    let url = `${this.url}?where={"SYS_IDENTIFIER":{"regex":"^${identifier}/[A-Za-z0-9_.]%2B"}, "SYS_ENTITY_TYPE":{"=": "${category}"}}`
    //console.log(url)
    return this.http.get(url)
    .map(res => res.json())

  }

  // query entity by identifier in form.dialog.component
  retrieveByIdentifierFull(identifier: string){
    return this.http.get(`${this.url}?SYS_IDENTIFIER=${identifier}`)
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

  postFile(file: any){
    let formData = new FormData()
    let headers = new Headers();
    //headers.set('Content-Type', 'multipart/form-data');
    formData.append('sampleExcel', file[0], file[0].name)
    console.log(file[0])
    console.log(file[0].name)
    return this.http.post(environment.apiUrl + '/excel', formData, {headers: headers})
    .map(res => res.json())
  }
}



