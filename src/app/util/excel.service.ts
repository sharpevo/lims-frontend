import {Injectable} from '@angular/core'

import {Observable} from 'rxjs/Observable'

import {EntityService} from '../entity/service'
import {GenreService} from '../genre/service'

@Injectable()
export class ExcelService {
    constructor(
        public entityService: EntityService,
        public genreService: GenreService,
    ) {
    }

    _getWorkcenterGenre$(workcenterId: string) {
        return this.entityService.retrieveGenre(workcenterId)
    }

    _getWorkcenterAttributeList$(workcenterGenreId: string) {
        return this.genreService.retrieveAttribute(workcenterGenreId)
    }

    getWorkcenterAttributeListFromFirstGenre$(workcenterId: string) {
        return this._getWorkcenterGenre$(workcenterId)
            .mergeMap(genreList => {
                return this._getWorkcenterAttributeList$(genreList[0].id)
            })
    }

    _getGroupAttributeList(attributeList: any[]) {
        return attributeList
            .filter(attribute => attribute['SYS_TYPE'] == "entity" &&
                !attribute['SYS_TYPE_ENTITY_REF'])
    }

    _getTargetEntityObject$(entityId: string) {
        return this.entityService.retrieveEntity(entityId, "object")
    }

    _addAttributeToParentMap$(attributeEntry: any, attribute: any) {
        return this._getTargetEntityObject$(attribute['SYS_TYPE_ENTITY']['id'])
            .mergeMap(targetEntityList => {
                return Observable.forkJoin(
                    targetEntityList.map(targetEntity => {
                        attributeEntry[targetEntity.id] = {}
                        let entityEntry = attributeEntry[targetEntity.id]
                        entityEntry['SYS_FLOOR_ENTITY_TYPE'] = attribute['SYS_FLOOR_ENTITY_TYPE']
                        targetEntity['SYS_SCHEMA'].forEach(schema => {
                            entityEntry[schema['SYS_CODE']] = targetEntity[schema['SYS_CODE']]
                        })
                        return Observable.of(attribute)
                    })
                )
            })
    }

    getParentMap$(attributeList: any[]) {
        let parentMap = {}

        attributeList = this._getGroupAttributeList(attributeList)
        return Observable.forkJoin(
            attributeList.map(attribute => { // should be one attribute only
                parentMap[attribute['SYS_CODE']] = {}
                let attributeEntry = parentMap[attribute['SYS_CODE']]
                return this._addAttributeToParentMap$(
                    attributeEntry,
                    attribute)
            })
        )
            .map(data => parentMap)

    }

}
