import {Injectable} from '@angular/core'

import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/throw'

import {EntityService} from '../entity/service'
import {GenreService} from '../genre/service'
import {SampleService} from '../models/sample'
import {LogService} from '../log/log.service'
import {DatePipe} from '@angular/common'

@Injectable()
export class ExcelService {
    constructor(
        public entityService: EntityService,
        public genreService: GenreService,
        public sampleService: SampleService,
        public logger: LogService,
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

    _getSampleById(sampleId: string) {
        return this.entityService.retrieveBy({"_id": sampleId})
            .map(sampleList => sampleList[0])
    }

    _assignAttributeFromExcelToDatabase(
        sampleInExcel: any,
        sampleInDatabase: any,
    ) {
        sampleInDatabase['SYS_SCHEMA'].forEach(schema => {
            if (sampleInExcel[schema['SYS_LABEL']]) {
                if (schema['SYS_TYPE'] != 'entity') {
                    sampleInDatabase[schema['SYS_CODE']] = sampleInExcel[schema['SYS_LABEL']]
                } else {
                    sampleInDatabase[schema['SYS_CODE']] = sampleInExcel[schema['SYS_LABEL']]
                    // TODO: convert value to id
                }
            }
        })
    }

    _getSampleIdInExcel(sample: any) {
        return sample['IDENTIFIER']
    }

    _submitSampleByExcel(
        sampleInExcel: any,
        workcenter: any,
        attributeInfo: any,
        newSampleList?: any[],
    ) {
        return this._getSampleById(this._getSampleIdInExcel(sampleInExcel))
            .mergeMap(sampleInDatabase => {
                this._assignAttributeFromExcelToDatabase(
                    sampleInExcel,
                    sampleInDatabase,
                )
                if (newSampleList) {
                    newSampleList.push(sampleInDatabase)
                }
                return this.sampleService.submitSample$(
                    workcenter,
                    sampleInDatabase,
                    sampleInDatabase,
                    attributeInfo,
                )
            })
    }

    _issueSampleByExcel(
        sampleInExcel,
        workcenter,
        attributeInfo,
        newSampleList?: any[],
    ) {
        let newSample = {}
        attributeInfo['attributeList'].forEach(attribute => {
            newSample[attribute['SYS_CODE']] = sampleInExcel[attribute[attribute['SYS_LABEL']]]
        })

        return this.entityService.retrieveGenre(workcenter.id)
            .mergeMap(workcenterGenreList => {
                newSample['SYS_GENRE'] = workcenterGenreList[0]
                newSample['SYS_LABEL'] = 'SYS_SAMPLE_CODE'
                newSample['SYS_ENTITY_TYPE'] = 'collection'
                newSample['SYS_IDENTIFIER'] = workcenter['SYS_IDENTIFIER'] +
                    '/' +
                    newSample['SYS_SAMPLE_CODE'] + '.' +
                    new DatePipe('en-US').transform(new Date(), 'yyyyMMddHHmmss')

                if (newSampleList) {
                    newSampleList.push(newSample)
                }
                return this.sampleService.createObject$(
                    newSample,
                    attributeInfo,
                    true)
            })

    }

    postSampleByExcel$(
        workcenter: any,
        sampleListInExcel: any[],
        parentMap: any,
        workcenterAttributeList: any[],
        newSampleList?: any[],
    ) {
        if (!newSampleList) {
            newSampleList = []
        }
        let attributeInfo = {
            "attributeList": workcenterAttributeList,
            "parentMap": parentMap,
        }
        return Observable.forkJoin(
            sampleListInExcel.map(sampleInExcel => {
                if (this._getSampleIdInExcel(sampleInExcel)) {
                    return this._submitSampleByExcel(
                        sampleInExcel,
                        workcenter,
                        attributeInfo,
                        newSampleList,
                    )
                } else {

                    if (workcenter.SYS_IDENTIFIER !=
                        "/PROJECT_MANAGEMENT/GENERAL_PROJECT") {
                        this.logger.error(
                            "Invalid Excel file",
                            workcenter.SYS_IDENTIFIER)
                        return Observable.throw("Invalid Excel file")
                    }
                    return this._issueSampleByExcel(
                        sampleInExcel,
                        workcenter,
                        attributeInfo,
                        newSampleList,
                    )
                }
            })
        )
    }

}
