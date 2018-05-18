import {
    TestBed,
    inject,
} from '@angular/core/testing'
import {
    MockBackend,
} from '@angular/http/testing'
import {Router} from '@angular/router'

import {ExcelService} from './excel.service'
import {EntityService} from '../entity/service'
import {GenreService} from '../genre/service'
import {SampleService} from '../models/sample'
import {UtilService} from '../util/service'
import {UserInfoService} from '../util/user.info.service'
import {CustomHttpService} from '../util/custom.http.service'
import {
    Http,
    HttpModule,
    XHRBackend,
    BaseRequestOptions,
    ResponseOptions,
} from '@angular/http'

import {MaterialModule} from '../material.module'

import {Observable} from 'rxjs/Observable'

import {SpinnerService} from '../util/spinner.service'
import {MatSnackBar} from '@angular/material'
import {LogService} from '../log/log.service'
import {LogPublisherService} from '../log/publisher.service'

import {DatePipe} from '@angular/common'

describe("ExcelService", () => {
    let service: ExcelService
    let entityService: EntityService
    let genreService: GenreService
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpModule,
                MaterialModule, // no provider for overlay!
            ],
            providers: [
                EntityService,
                GenreService,
                MockBackend,
                BaseRequestOptions,
                MatSnackBar,
                SpinnerService,
                SampleService,
                UtilService,
                UserInfoService,
                LogService,
                LogPublisherService,
                DatePipe,
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy("navigate")
                    },
                },
                {
                    provide: CustomHttpService,
                    useFactory: (
                        backend: MockBackend,
                        options: BaseRequestOptions,
                        snackbar: MatSnackBar,
                        spinner: SpinnerService,
                        userinfo: UserInfoService,
                    ) => {
                        return new CustomHttpService(
                            backend,
                            options,
                            snackbar,
                            spinner,
                            userinfo
                        )
                    },
                    deps: [
                        MockBackend,
                        BaseRequestOptions,
                        MatSnackBar,
                        SpinnerService,
                        UserInfoService,
                    ],
                },
            ],

        })
    })

    beforeEach(
        inject([
            CustomHttpService,
            EntityService,
            GenreService,
            SampleService,
            LogService,
        ], (
            httpService: CustomHttpService,
            entityService: EntityService,
            genreService: GenreService,
            sampleService: SampleService,
            logService: LogService,
            ) => {
                service = new ExcelService(
                    entityService,
                    genreService,
                    sampleService,
                    logService
                )
            }))

    it("_getWorkcenterGenre$ should return genre by id", done => {
        let genreList = [
            {
                "_id": "5ab88e01d98a70566c707cc0",
                "SYS_IDENTIFIER": "/PRODUCT_WORKCENTER/DNA_EXTRACTION/",
                "SYS_ENTITY": "5ab88e01d98a70566c707cbf",
                "label": "样品提取 Genre",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.965Z",
                "createdAt": "2018-03-26T06:06:57.965Z",
                "SYS_LABEL": "label",
                "SYS_ENTITY_IDENTIFIER": "/PRODUCT_WORKCENTER/DNA_EXTRACTION",
                "id": "5ab88e01d98a70566c707cc0"
            }
        ]
        spyOn(service.entityService, "retrieveGenre").and.returnValue(
            Observable.of(genreList)
        )
        service._getWorkcenterGenre$('FAKE_ID').subscribe(data => {
            expect(genreList).toEqual(data)
            done()
        })
    })

    it("getWorkcenterAttributeListFromFirstGenre$ should return attributeList of the first genre in the list", done => {
        let genreList = [
            {
                "SYS_ENTITY": "FAKE_WORKCENTER_ID",
                "id": "FAKE_GENRE_ID_1st",
            },
            {
                "SYS_ENTITY": "FAKE_WORKCENTER_ID",
                "id": "FAKE_GENRE_ID_2nd",
            }
        ]

        let attributeList = [
            {
                "SYS_GENRE": "FAKE_GENRE_ID_1st",
            }
        ]

        spyOn(service.entityService, "retrieveGenre").and.returnValue(
            Observable.of(genreList)
        )

        spyOn(service.genreService, "retrieveAttribute").and.callFake(
            workcenterGenreId => {
                return Observable.of(attributeList.filter(attribute => attribute.SYS_GENRE = workcenterGenreId))
            }
        )

        service.getWorkcenterAttributeListFromFirstGenre$("FAKE_ID").subscribe(attributeList => {
            expect(attributeList).toEqual(attributeList)
            done()
        })

    })

    it("getParentMap$ should return parentMap", done => {
        let attributeList = [
            {
                "SYS_CODE": "FAKE_CODE_1",
                "SYS_TYPE_ENTITY": "FAKE_ENTITY_ID_1",
                "SYS_TYPE": "entity",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_FLOOR_ENTITY_TYPE": "collection",
            },
            {
                "SYS_CODE": "FAKE_CODE_2",
                "SYS_TYPE_ENTITY": "FAKE_ENTITY_ID_2",
                "SYS_TYPE": "entity",
                "SYS_TYPE_ENTITY_REF": true,
            },
        ]

        let schemaList = [
            {
                "SYS_CODE": "SYS_CHECKED",
                "SYS_TYPE": "boolean",
                "SYS_GENRE": "FAKE_GENRE_ID",
                "SYS_LABEL": ""
            },
            {
                "SYS_CODE": "SYS_SOURCE",
                "SYS_TYPE": "entity",
                "SYS_GENRE": "FAKE_GENRE_ID",
                "SYS_LABEL": "Material"
            },
            {
                "SYS_CODE": "SYS_QUANTITY",
                "SYS_TYPE": "number",
                "SYS_GENRE": "FAKE_GENRE_ID",
                "SYS_LABEL": "Quantity"
            },
            {
                "SYS_CODE": "REMARK",
                "SYS_TYPE": "string",
                "SYS_GENRE": "FAKE_GENRE_ID",
                "SYS_LABEL": "Remark"
            }
        ]

        let entityList =
            [
                {
                    "id": "FAKE_ENTITY_ID_1",
                    "REMARK": "FAKE_REMARK_1",
                    "SYS_QUANTITY": 10,
                    "SYS_SOURCE": "FAKE_SOURCE_1",
                    "SYS_CHECKED": true,
                    "SYS_SCHEMA": schemaList
                },
                {
                    "id": "FAKE_ENTITY_ID_2",
                    "REMARK": "FAKE_REMARK_2",
                    "SYS_QUANTITY": 20,
                    "SYS_SOURCE": "FAKE_SOURCE_2",
                    "SYS_CHECKED": true,
                    "SYS_SCHEMA": schemaList
                },

            ]

        let parentMap =
            {
                "FAKE_CODE_1": {
                    "FAKE_ENTITY_ID_1": {
                        "SYS_FLOOR_ENTITY_TYPE": "collection",
                        "SYS_CHECKED": true,
                        "SYS_SOURCE": "FAKE_SOURCE_1",
                        "SYS_QUANTITY": 10,
                        "REMARK": "FAKE_REMARK_1"
                    },
                    "FAKE_ENTITY_ID_2": {
                        "SYS_FLOOR_ENTITY_TYPE": "collection",
                        "SYS_CHECKED": true,
                        "SYS_SOURCE": "FAKE_SOURCE_2",
                        "SYS_QUANTITY": 20,
                        "REMARK": "FAKE_REMARK_2"
                    }
                }
            }

        spyOn(service.entityService, "retrieveEntity").and.returnValue(
            Observable.of(entityList)
        )

        service.getParentMap$(attributeList).subscribe(data => {
            expect(data).toEqual(parentMap)
            done()
        })

    })

    it("_getSampleById should return first sample when query sample by id", done => {
        let sampleId = "FAKE_SAMPLE_ID"
        let sampleList = [
            {
                "_id": sampleId,
                "SYS_SAMPLE_CODE": "18R0001",
            },
            {
                "_id": sampleId,
                "SYS_SAMPLE_CODE": "18R0002",
            }
        ]

        spyOn(service.entityService, "retrieveBy").and.returnValue(
            Observable.of(sampleList)
        )

        service._getSampleById(sampleId)
            .subscribe(sample => {
                expect(sample).toEqual(sampleList[0])
                done()
            })
    })

    it("_assignAttributeFromExcelToDatabase should assign values of samples from excel to database object", done => {
        let sampleInExcel = {
            "key-3": 3.3,
            "key-2": 2.2,
        }
        let sampleInDatabase = {
            "KEY_1": 1,
            "KEY_2": 2,
            "SYS_SCHEMA": [
                {
                    "SYS_CODE": "KEY_2",
                    "SYS_LABEL": "key-2",
                },
                {
                    "SYS_CODE": "KEY_3",
                    "SYS_LABEL": "key-3",
                },
            ]
        }

        service._assignAttributeFromExcelToDatabase(sampleInExcel, sampleInDatabase, sampleInDatabase.SYS_SCHEMA)
        expect(sampleInDatabase['KEY_2']).toEqual(sampleInExcel['key-2'])
        expect(sampleInDatabase['KEY_3']).toEqual(sampleInExcel['key-3'])
        done()
    })

    it("_getSampleIdInExcel should return sample identifier as id", done => {
        let sampleId = "FAKE_SAMPLE_ID"
        let sampleInExcel = {
            "IDENTIFIER": sampleId,
        }
        expect(service._getSampleIdInExcel(sampleInExcel)).toEqual(sampleId)
        done()
    })

    it("_getFirstGenreByWorkcenterId$ should return the first genre in the list", done => {
        let genreList = [
            {
                "id": "A"
            },
            {
                "id": "B"
            }
        ]

        spyOn(service.entityService, "retrieveGenre").and.returnValue(
            Observable.of(genreList)
        )
        service._getFirstGenreByWorkcenterId$("FAKE_WORKCENTER_ID")
            .subscribe(genre => {
                expect(genre).toEqual(genreList[0])
                done()
            })
    })

    it("_initSample should init sample with basic information", done => {
        let sampleInput = {
            "KEY_1": 1
        }
        let genre = {
            "KEY_GENRE": "genre"
        }
        let workcenterIdentifier = "FAKE_IDENTIFIER"
        let sampleOutput = {
            "KEY_1": 1,
            "SYS_GENRE": {
                "KEY_GENRE": "genre"
            },
            "SYS_LABEL": "SYS_SAMPLE_CODE",
            "SYS_ENTITY_TYPE": "collection",
            "SYS_IDENTIFIER": "FAKE_IDENTIFIER/undefined.20180419100136"
        }

        spyOn(Date.prototype, "toISOString").and.returnValue("2018-04-19T02:01:36.435Z")
        service._initSample(sampleInput, genre, workcenterIdentifier)
        expect(sampleOutput).toEqual(sampleInput)
        done()
    })

    it("_updateSampleObject should update sample in database from excel", done => {
        let attributeInfo = {
            "attributeList": [
                {
                    "SYS_CODE": "KEY_2",
                    "SYS_LABEL": "label",
                    "label": "属性2",
                },
                {
                    "SYS_CODE": "KEY_3",
                    "SYS_LABEL": "label",
                    "label": "属性3",
                },
            ]
        }

        let newSample = {
            "KEY_1": 1,
            "KEY_2": 2
        }

        let sampleInExcel = {
            "属性2": 2.2,
            "属性3": 3.3,
        }

        let sampleOutput = {
            "KEY_1": 1,
            "KEY_2": 2.2,
            "KEY_3": 3.3
        }

        service._updateSampleObject(sampleInExcel, newSample, attributeInfo)
        expect(sampleOutput).toEqual(newSample)
        done()
    })

    describe("postSampleByExcel$", () => {
        let workcenter = {
        }
        let sampleListInExcel = [
            {
                "IDENTIFIER": "FAKE_IDENTIFIER",
            }
        ]
        let parentMap = {
        }
        let workcenterAttributeList = [
        ]

        beforeEach(() => {
            spyOn(service, "_issueSampleByExcel").and.returnValue(Observable.of({}))
            spyOn(service, "_submitSampleByExcel").and.returnValue(Observable.of({}))
        })

        it("should call _submitSampleByExcel", done => {
            service.postSampleByExcel$(
                workcenter,
                sampleListInExcel,
                parentMap,
                workcenterAttributeList,
            ).subscribe(data => {
                expect(service._issueSampleByExcel).not.toHaveBeenCalled()
                expect(service._submitSampleByExcel).toHaveBeenCalled()
                done()
            })

        })

        it("should call _issueSampleByExcel", done => {
            sampleListInExcel[0]['IDENTIFIER'] = ""
            workcenter['SYS_IDENTIFIER'] = "/PROJECT_MANAGEMENT/GENERAL_PROJECT"
            service.postSampleByExcel$(
                workcenter,
                sampleListInExcel,
                parentMap,
                workcenterAttributeList,
            ).subscribe(data => {
                expect(service._issueSampleByExcel).toHaveBeenCalled()
                expect(service._submitSampleByExcel).not.toHaveBeenCalled()
                done()
            })
        })

        it("should throw error if workcenter identifier is not match", done => {

            sampleListInExcel[0]['IDENTIFIER'] = ""
            workcenter['SYS_IDENTIFIER'] = "FAKE_IDENTIFIER"

            service.postSampleByExcel$(
                workcenter,
                sampleListInExcel,
                parentMap,
                workcenterAttributeList,
            ).subscribe(
                data => {},
                error => {
                    expect(error).toContain("Invalid")
                    done()
                })
        })

    })

    it("updateSampleInExcelFromObject should update samples in excel by form object", done => {
        let formObject = {
            "SYS_WORKCENTER_OPERATOR": "5ab88e01d98a70566c707c64",
            "CONF_DNA_EXTRACTION_QUBIT": 55,
            "CONF_DNA_EXTRACTION_OD230": 66
        }

        let sampleListInExcel = [
            {
                "Nanodrop ng/ul": 1.1,
                "Qubit ng/ul": 2.1,
                "IDENTIFIER": "5ac19eaf6c208011bc4067a7"
            },
            {
                "Nanodrop ng/ul": 1.2,
                "Qubit ng/ul": 2.2,
                "IDENTIFIER": "5ac19eaf6c208011bc4067af"
            },
            {
                "Nanodrop ng/ul": 1.3,
                "Qubit ng/ul": 2.3,
                "IDENTIFIER": "5ac19eaf6c208011bc4067b7"
            }
        ]

        let attributeList = [
            {
                "SYS_CODE": "CONF_DNA_EXTRACTION_OD230",
                "label": "OD 260/230",
                "SYS_LABEL": "label",
            },
            {
                "SYS_CODE": "CONF_DNA_EXTRACTION_QUBIT",
                "test": "Qubit ng/ul",
                "SYS_LABEL": "test",
            },
        ]

        let sampleListInExcelNew = [
            {
                "Nanodrop ng/ul": 1.1,
                "Qubit ng/ul": 55,
                "OD 260/230": 66,
                "IDENTIFIER": "5ac19eaf6c208011bc4067a7"
            },
            {
                "Nanodrop ng/ul": 1.2,
                "Qubit ng/ul": 55,
                "OD 260/230": 66,
                "IDENTIFIER": "5ac19eaf6c208011bc4067af"
            },
            {
                "Nanodrop ng/ul": 1.3,
                "Qubit ng/ul": 55,
                "OD 260/230": 66,
                "IDENTIFIER": "5ac19eaf6c208011bc4067b7"
            }
        ]

        service.updateSampleInExcelFromFormObject(
            sampleListInExcel,
            formObject,
            attributeList)

        expect(sampleListInExcel).toEqual(sampleListInExcelNew)
        done()
    })

})
