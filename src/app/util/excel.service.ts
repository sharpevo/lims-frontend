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
        attributeList: any[],
    ) {
        attributeList.forEach(schema => {
            //let label = schema['SYS_LABEL']
            let label = schema[schema['SYS_LABEL']]
            if (sampleInExcel[label]) {
                if (schema['SYS_TYPE'] != 'entity') {
                    sampleInDatabase[schema['SYS_CODE']] = sampleInExcel[label]
                } else {
                    sampleInDatabase[schema['SYS_CODE']] = sampleInExcel[label]
                    // TODO: convert value to id
                }
            }
        })
        if (sampleInExcel.hasOwnProperty('SYS_GENRE')) {
            sampleInDatabase['SYS_GENRE'] = sampleInExcel['SYS_GENRE']
        }
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
                    attributeInfo['attributeList'],
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

    _getFirstGenreByWorkcenterId$(workcenterId: string) {
        return this.entityService.retrieveGenre(workcenterId)
            .map(genreList => genreList[0])
    }

    _initSample(newSample: any, genre: any, workcenterIdentifier: string) {
        if (!newSample.hasOwnProperty('SYS_GENRE')) {
            newSample['SYS_GENRE'] = genre // object rather id, refered in backend
        }
        newSample['SYS_LABEL'] = 'SYS_SAMPLE_CODE'
        newSample['SYS_ENTITY_TYPE'] = 'collection'
        let dateString = new Date().toISOString()
        let timestamp = new DatePipe('en-US').transform(dateString, 'yyyyMMddHHmmss')
        newSample['SYS_IDENTIFIER'] = workcenterIdentifier +
            '/' +
            newSample['SYS_SAMPLE_CODE'] + '.' +
            timestamp
    }

    _updateSampleObject(sampleInExcel: any, newSample: any, attributeInfo: any) {
        attributeInfo['attributeList'].forEach(attribute => {
            newSample[attribute['SYS_CODE']] = sampleInExcel[attribute[attribute['SYS_LABEL']]]
        })
        if (sampleInExcel.hasOwnProperty('SYS_GENRE')) {
            newSample['SYS_GENRE'] = sampleInExcel['SYS_GENRE']
        }
    }

    _issueSampleByExcel(
        sampleInExcel,
        workcenter,
        attributeInfo,
        newSampleList?: any[],
    ) {
        let newSample = {}

        this._updateSampleObject(sampleInExcel, newSample, attributeInfo)

        return this._getFirstGenreByWorkcenterId$(workcenter.id)
            .mergeMap(genre => {
                this._initSample(newSample, genre, workcenter['SYS_IDENTIFIER'])
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

    updateSampleInExcelFromFormObject(
        sampleListInExcel: any[],
        formObject: any,
        attributeList: any[]
    ) {
        for (let attribute of attributeList) {
            let key = attribute['SYS_CODE']
            if (formObject && formObject.hasOwnProperty(key)) {
                let label = attribute[attribute['SYS_LABEL']]
                for (let sampleInExcel of sampleListInExcel) {
                    sampleInExcel[label] = formObject[key]
                    if (formObject.hasOwnProperty('SYS_GENRE')) {
                        sampleInExcel['SYS_GENRE'] = formObject['SYS_GENRE']
                    }
                }
                continue
            }
        }
    }

}
