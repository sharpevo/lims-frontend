// imports{{{
import {
    TestBed,
    inject,
} from '@angular/core/testing'
import {
    MockBackend,
} from '@angular/http/testing'
import {
    Http,
    HttpModule,
    BaseRequestOptions,
    ResponseOptions,
} from '@angular/http'
import {Router} from '@angular/router'
import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'

import {MaterialModule} from '../material.module'
import {MatSnackBar} from '@angular/material'

// app
import {SampleService} from './sample'
import {UserInfoService} from '../util/user.info.service'
import {EntityService} from '../entity/service'
import {GenreService} from '../genre/service'
import {UtilService} from '../util/service'
import {SpinnerService} from '../util/spinner.service'
import {CustomHttpService} from '../util/custom.http.service'

import {LogService, LogLevel} from '../log/log.service'

// }}}

class MockEntityService extends EntityService {
    create(sample: any){
        return Observable.of(sample)
    }
}

class MockUserInfoService extends UserInfoService {
    getUserInfo(){
        return {
            name: "test",
            id: "1111",
        }
    }
}

describe("SampleService test", () => {
    let backend: MockBackend
    let service: SampleService
    let mockSample = {
        SYS_SAMPLE_CODE: '18R0010',
        creator: {
            name: 'test',
        }
    }

    // beforeEach: TestBed{{{
    beforeEach(()=> {
        TestBed.configureTestingModule({
            imports: [
                HttpModule,
                MaterialModule, // no provider for overlay!
            ],
            providers: [
                MockBackend,
                SampleService,
                BaseRequestOptions,
                MatSnackBar,
                SpinnerService,
                {
                    // or get userinfo: undefined in the constructor of sampleservice.
                    provide: UserInfoService,
                    useClass: MockUserInfoService,
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

                GenreService,
                UtilService,
                {
                    provide: EntityService,
                    useClass: MockEntityService,
                },
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy("navigate")
                    },
                },

            ],
        }).compileComponents()
        backend = TestBed.get(MockBackend)
    })// }}}

    // beforeEach: Inject{{{
    beforeEach(
        // inject scope is out of the testbed
        // so the class should be the mocked one
        inject([
            Http,
            MatSnackBar,
            GenreService,
            UtilService,
            Router,
            EntityService,
            LogService,
        ],
        (
            http: CustomHttpService,
            rawHttp: Http,
            snackbar: MatSnackBar,
            genreService: GenreService,
            utilService: UtilService,
            userInfoService: UserInfoService,
            router: Router,
            entityService: EntityService,
            logger: LogService,
        ) => {
            let mockEntityService = new MockEntityService(http)
            let mockUserInfoService = new MockUserInfoService(logger)
            let newGenreService = new GenreService(http)
            let newUtilService = new UtilService(http, rawHttp)
            service = new SampleService(
                snackbar,
                //genreService,
                newGenreService,
                newUtilService,
                mockUserInfoService,
                router,
                mockEntityService,
		logger,
            )
        })
    )// }}}

    // submitSubEntity{{{
    it('TEST: submitSubEntity', done => {

        // PREPARE
        let genreOfTargetEntity = [
            {
                "id": "5a726c698a2bb51617825374"
            }
        ]
        let subEntity = {
            "SYS_SAMPLE_CODE": "18R2001",
        }
        let targetEntity = { //workcenter target
            "SYS_GENRE": "5a726c698a2bb5161782536b",
            "id": "5a726c698a2bb51617825373",
        }
        let targetEntityInput = { //workcenter input
            "SYS_CHECKED": true,
            "SYS_ORDER": 10,
            "SYS_SOURCE": "5a726c698a2bb51617825373",
            "SYS_DURATION": 2,
        }
        let newSubEntity = {
            "SYS_SAMPLE_CODE": "18R2001",
            "SYS_CHECKED": true,
            "SYS_ORDER": 10,
            "SYS_SOURCE": "5a726c698a2bb51617825373",
            "SYS_DURATION": 2,
        }
        let response = {
            "workcenter": targetEntity,
            "sample": newSubEntity,
        }
        spyOn(service.entityService, "create").and.returnValue(
            Observable.of(newSubEntity)
        )
        spyOn(service.genreService, "retrieveBy").and.returnValues(
            Observable.of(genreOfTargetEntity), // test issue sample
            Observable.of({}), // test submit sample
        )

        // ISSUE
        service.submitSubEntity(
            subEntity,
            targetEntity,
            targetEntityInput,
        ).subscribe(workcenterAndSample => {
            let workcenter = workcenterAndSample['workcenter']
            let sample = workcenterAndSample['sample']

            expect(sample.SYS_GENRE).toEqual(genreOfTargetEntity[0].id)
            expect(sample.SYS_SAMPLE_CODE).toEqual(response.sample.SYS_SAMPLE_CODE)
            Object.keys(targetEntityInput).forEach(attr => {
                expect(sample[attr]).toEqual(targetEntityInput[attr])
            })
        })

        // SUBMIT
        service.submitSubEntity(
            subEntity,
            targetEntity,
            targetEntityInput,
        ).subscribe(workcenterAndSample => {
            let sample = workcenterAndSample['sample']
            expect(sample.SYS_GENRE).toEqual(targetEntity['SYS_GENRE'])
            done()
        })

    })// }}}

    // createSubEntity{{{
    it('TEST: createSubEntity', done => {

        // PREPARE
        let sourceEntity = {
            id: "5ab0847f1c62422cffc9fb97",
            SYS_SAMPLE_CODE: "18R2003",
            SYS_CODE: "18R2003.GENERAL_PROJECT.20180320114800",
            SYS_LABEL: "SYS_SAMPLE_CODE",
            SYS_AUDIT_DOCSET: "5a726c688a2bb51617825318_18R2003_1521517695241",
            CONF_GENERAL_PROJECT_PROJECT_CODE: "BKZN17723-17Q12V1",
        }
        let targetEntity = {
            SYS_IDENTIFIER: "/PRODUCT_WORKCENTER/SEQUENCE_DATA",
            SYS_ENTITY_TYPE: "class",
        }
        let workcenterAttributeList = [
            {
                SYS_CODE: "CONF_GENERAL_PROJECT_PROJECT_CODE",
            },
        ]
        let targetEntityInput = {
        }
        let targetEntityAttributeList = [
            {
                SYS_CODE: "KAPA_LOT_NUMBER",
            },
        ]
        spyOn(service.entityService, "retrieveAttribute").and.returnValue(
            Observable.of(targetEntityAttributeList)
        )
        spyOn(service, "submitSubEntity").and.callFake(function(
            _subEntity,
            _targetEntity,
            _targetEntityInput,
        ){
            return Observable.of({
                subEntity: _subEntity,
                targetEntity: _targetEntity,
                targetEntityInput: _targetEntityInput,
            })
        })

        // ISSUE
        service.createSubEntity(
            sourceEntity,
            targetEntity,
            workcenterAttributeList,
            targetEntityInput,
        ).subscribe(submitSubEntityArgs => {
            let _subEntity = submitSubEntityArgs.subEntity

            expect(_subEntity.SYS_LABEL).toEqual(sourceEntity.SYS_LABEL)
            expect(_subEntity[_subEntity.SYS_LABEL]).toEqual(sourceEntity[sourceEntity.SYS_LABEL])
            expect(_subEntity.SYS_TARGET).toEqual(sourceEntity.id)
            expect(_subEntity.SYS_AUDIT_DOCSET).toEqual(sourceEntity.SYS_AUDIT_DOCSET)
            expect(_subEntity.SYS_IDENTIFIER).toContain(targetEntity.SYS_IDENTIFIER + "/" + sourceEntity.SYS_CODE + ".")

            expect(_subEntity.SYS_ENTITY_TYPE).toEqual("collection")
            workcenterAttributeList.forEach(attr => {
                expect(_subEntity[attr.SYS_CODE]).toEqual(sourceEntity[attr.SYS_CODE])
            })
        })

        // SUBMIT
        targetEntity.SYS_ENTITY_TYPE = "collection"
        targetEntity["KAPA_LOT_NUMBER"] = "1024"
        service.createSubEntity(
            sourceEntity,
            targetEntity,
            workcenterAttributeList,
            targetEntityInput,
        ).subscribe(submitSubEntityArgs => {
            let _subEntity = submitSubEntityArgs.subEntity
            expect(_subEntity.SYS_ENTITY_TYPE).toEqual("object")
            targetEntityAttributeList.forEach(attr => {
                expect(_subEntity[attr.SYS_CODE]).toEqual(targetEntity[attr.SYS_CODE])
            })
            done()
        })

    })// }}}

    // getScheduledDate{{{
    it('TEST: getScheduledDate', done => {
        let baseDate = new Date()
        let SYS_DATE_SCHEDULED: Date
        let sourceEntityScheduledDate: Date
        let targetEntityDuration: number
        spyOn(window, "Date").and.callFake(function() {
            return baseDate
        })

        // generate new date for the first targetEntityInput
        // without any sourceEntityScheduledDate
        expect(service.getScheduledDate(
            SYS_DATE_SCHEDULED,
            sourceEntityScheduledDate,
            targetEntityDuration,
        )).toEqual(baseDate)

        // generate new date for the first targetEntityInput
        // with a sourceEntityScheduledDate
        sourceEntityScheduledDate = new Date()
        expect(service.getScheduledDate(
            SYS_DATE_SCHEDULED,
            sourceEntityScheduledDate,
            targetEntityDuration,
        )).toEqual(sourceEntityScheduledDate)

        // get scheduled date for the left targetentityInput
        // without duration
        SYS_DATE_SCHEDULED = new Date()
        expect(service.getScheduledDate(
            SYS_DATE_SCHEDULED,
            sourceEntityScheduledDate,
            targetEntityDuration,
        )).toEqual(SYS_DATE_SCHEDULED)

        // get scheduled date for the left targetentityInput
        // with duration
        SYS_DATE_SCHEDULED = new Date()
        targetEntityDuration = 2
        expect(service.getScheduledDate(
            SYS_DATE_SCHEDULED,
            sourceEntityScheduledDate,
            targetEntityDuration,
        )).toEqual(new Date(SYS_DATE_SCHEDULED.getDate() + targetEntityDuration))

        done()
    })// }}}

    // buildRelationship{{{
    it('TEST: buildRelationship', done => {
        let date = new Date()
        let sourceEntity = {
            SYS_DATE_SCHEDULED: date,
        }
        let attributeInfo = {
            attributeList: [],
            parentMap: {
                ROUTING: { // targetEntityMap
                    "5a726c698a2bb516178253d9": { // targetEntityInput
                        SYS_CHECKED: true,
                        SYS_ORDER: 20,
                        SYS_SOURCE: "5a726c698a2bb51617825383",
                        SYS_DURATION: 2,
                        SYS_FLOOR_ENTITY_TYPE: "class"
                    },
                    "5a726c698a2bb516178253d8": {
                        SYS_CHECKED: true,
                        SYS_ORDER: 10,
                        SYS_SOURCE: "5a726c698a2bb51617825373",
                        SYS_DURATION: 5,
                        SYS_FLOOR_ENTITY_TYPE: "class",
                    },
                }
            },
        }
        let targetEntity = {
            SYS_ENTITY_TYPE: "class",
        }
        let materialKapa = {
            "_id": "5a726c688a2bb51617825336",
            "SYS_IDENTIFIER": "/MATERIAL/KAPA_HIFI/LOT160806",
            "SYS_ENTITY_TYPE": "collection",
            "SYS_GENRE": "5a726c688a2bb51617825335",
            "label": "LOT160806",
            "__v": 0,
            "updatedAt": "2018-02-01T01:24:56.997Z",
            "createdAt": "2018-02-01T01:24:56.997Z",
            "SYS_PARENT_LIST": [],
            "SYS_LABEL": "label",
            "SYS_GENRE_IDENTIFIER": "/MATERIAL/KAPA_HIFI/",
            "SYS_CODE": "LOT160806",
            "id": "5a726c688a2bb51617825336",
            "SYS_SCHEMA": []
        }
        spyOn(service.entityService, "retrieveById").and.returnValue(
            Observable.of(targetEntity)
        )
        spyOn(service.entityService, "retrieveEntity").and.returnValue(
            Observable.of([materialKapa])
        )
        spyOn(service, "createSubEntity").and.callFake(function(
            _sourceEntity,
            _targetEntity,
            _attributeList,
            _targetEntityInput,
        ){
            return Observable.of({
                sourceEntity: _sourceEntity,
                targetEntity: _targetEntity,
                attributeList: _attributeList,
                targetEntityInput: _targetEntityInput,
            })
        })

        let count = 0
        let SYS_DATE_SCHEDULED: Date
        service.buildRelationship(
            sourceEntity,
            attributeInfo,
        ).subscribe(concatedObservable => {
            let _sourceEntity = concatedObservable['sourceEntity']
            let _targetEntity = concatedObservable['targetEntity']
            let _attributeList = concatedObservable['attributeList']
            let _targetEntityInput = concatedObservable['targetEntityInput']
            switch (count) {
                case 0:
                    expect(_targetEntityInput.SYS_ORDER).toEqual(10)
                SYS_DATE_SCHEDULED = _targetEntityInput.SYS_DATE_SCHEDULED
                expect(_targetEntityInput.SYS_DATE_SCHEDULED).toEqual(
                    _sourceEntity.SYS_DATE_SCHEDULED
                )
                expect(_targetEntityInput.SYS_DATE_ARRIVED).toEqual(
                    _targetEntityInput.SYS_DATE_SCHEDULED
                )
                count += 1
                break
                case 1:
                    SYS_DATE_SCHEDULED.setDate(SYS_DATE_SCHEDULED.getDate() + _targetEntityInput.SYS_DURATION)
                expect(_targetEntityInput.SYS_DATE_SCHEDULED).toEqual(
                    SYS_DATE_SCHEDULED
                )
                expect(_targetEntityInput.SYS_DATE_ARRIVED).not.toEqual(
                    _targetEntityInput.SYS_DATE_SCHEDULED
                )
                break
            }
            expect(_targetEntity).toEqual(targetEntity)
        })

        done()
        targetEntity.SYS_ENTITY_TYPE = "collection"
        service.buildRelationship(
            sourceEntity,
            attributeInfo,
        ).subscribe(concatedObservable => {
            let _sourceEntity = concatedObservable['sourceEntity']
            let _targetEntity = concatedObservable['targetEntity']
            let _attributeList = concatedObservable['attributeList']
            let _targetEntityInput = concatedObservable['targetEntityInput']
            expect(_targetEntity).toEqual(materialKapa)
            expect(_targetEntity).not.toEqual(targetEntity)

        })

    })// }}}

    // createObject${{{
    it('TEST: createObject$', done => {
        let date = new Date()
        let objectRequest = {
            SYS_SAMPLE_CODE: "FAKE_SAMPLE_CODE",
            SYS_DATE_SCHEDULED: date,
        }
        let objectResponse = {
            SYS_SAMPLE_CODE: "FAKE_SAMPLE_CODE",
            SYS_DATE_SCHEDULED: date,
            SYS_AUDIT_DOCSET: "FAKE_DOCSET",
            id: "FAKE_ID",
            FAKE_KEY: "FAKE_VALUE",
        }
        let attributeInfo: any
        let issueSample: boolean
        service.userInfo.limsid = "FAKE_LIMSID"
        spyOn(service.utilService, "getDocSet").and.returnValue("FAKE_DOCSET")
        spyOn(service.entityService, "create").and.returnValue(
            Observable.of(objectResponse)
        )
        spyOn(service, "buildRelationship").and.callFake(function(
            _object,
            _attributeInfo,
        ){
            return Observable.concat(Observable.of({
                object: _object,
                attributeInfo: _attributeInfo,
            }))
        })

        spyOn(service, "isSuspended").and.returnValues(
            // not called if issueSample
            Observable.of(false),
            Observable.of(true),
        )

        // ISSUE
        issueSample = true
        attributeInfo = {
            parentMap: {
                ROUTING: { // targetEntityMap
                    "5a726c698a2bb516178253d9": { // targetEntityInput
                        SYS_CHECKED: true,
                        SYS_ORDER: 20,
                        SYS_SOURCE: "5a726c698a2bb51617825383",
                        SYS_DURATION: 2,
                        SYS_FLOOR_ENTITY_TYPE: "class"
                    },
                    "5a726c698a2bb516178253d8": {
                        SYS_CHECKED: true,
                        SYS_ORDER: 10,
                        SYS_SOURCE: "5a726c698a2bb51617825373",
                        SYS_DURATION: 5,
                        SYS_FLOOR_ENTITY_TYPE: "class",
                    },
                }
            },
        }
        service.createObject$(
            objectRequest,
            attributeInfo,
            issueSample,
        ).subscribe(data => {
            let _object = data['object']
            let _attributeInfo = data['attributeInfo']
            let _issueSample = data['issueSample']
            expect(_object.SYS_WORKCENTER_OPERATOR).toBeUndefined()
            expect(_object.SYS_AUDIT_DOCSET).toEqual("FAKE_DOCSET")
        })

        //SUBMIT
        issueSample = false
        spyOn(service.entityService, "update").and.returnValue(
            Observable.of(objectResponse)
        )
        spyOn(service.entityService, "retrieveByIdentifierFull").and.returnValue(
            Observable.of([objectResponse])
        )
        service.createObject$(
            objectRequest,
            attributeInfo,
            issueSample,
        ).subscribe(data => {
            let _object = data['object']
            let _attributeInfo = data['attributeInfo']
            let _issueSample = data['issueSample']
            expect(_object.id).toEqual(objectResponse.id)
            expect(_object.SYS_DATE_SCHEDULED).toEqual(objectResponse.SYS_DATE_SCHEDULED)
        })

        expect(() => service.createObject$(
            objectRequest,
            attributeInfo,
            issueSample,
        ).subscribe()).toThrow("Sample '" + objectRequest['SYS_SAMPLE_CODE'] + "' is suspended")
        done()


    })// }}}

    // terminateSampleObs{{{
    it('TEST: terminateSampleObs', done => {
        let dateNow = new Date()
        let dateAfter = new Date(dateNow)
        dateAfter.setDate(dateNow.getDate() + 5)
        let dateBefore = new Date(dateNow)
        dateBefore.setDate(dateNow.getDate() - 5)
        let sample = {
            SYS_SAMPLE_CODE: "FAKE_SAMPLE_CODE",
            SYS_DATE_SCHEDULED: dateNow,
        }
        let sampleBefore = {
            SYS_SAMPLE_CODE: "FAKE_SAMPLE_CODE",
            SYS_DATE_SCHEDULED: dateBefore,
        }
        let sampleBeforeButGeneralProject = {
            SYS_SAMPLE_CODE: "FAKE_SAMPLE_CODE",
            SYS_DATE_SCHEDULED: dateBefore,
            SYS_GENRE_IDENTIFIER: "/PROJECT_MANAGEMENT/GENERAL_PROJECT/",
        }
        let sampleNow = {
            SYS_SAMPLE_CODE: "FAKE_SAMPLE_CODE",
            SYS_DATE_SCHEDULED: dateNow,
        }
        let sampleAfter = {
            SYS_SAMPLE_CODE: "FAKE_SAMPLE_CODE",
            SYS_DATE_SCHEDULED: dateAfter,
        }
        let sampleList = [
            sampleBefore,
            sampleBeforeButGeneralProject,
            sampleNow,
            sampleAfter,
        ]
        spyOn(window, "Date").and.callFake(function() {
            if (arguments[0]) {
                return arguments[0]
            } else {
                return dateNow
            }
        })
        spyOn(service.entityService, "retrieveBy").and.returnValue(
            Observable.of(sampleList)
        )
        spyOn(service.entityService, "update").and.callFake(function(_sample){
            return Observable.of(_sample)
        })

        service.terminateSampleObs(sample)
        .subscribe(sample => {
            expect(sampleBefore['SYS_DATE_TERMINATED']).toBeUndefined()
            expect(sampleBeforeButGeneralProject['SYS_DATE_TERMINATED']).toEqual(dateNow)
            expect(sampleNow['SYS_DATE_TERMINATED']).toEqual(dateNow)
            expect(sampleAfter['SYS_DATE_TERMINATED']).toEqual(dateNow)
            done()
        })
    })// }}}

    // suspendSample{{{
    it('TEST: suspendSample', done => {
        let dateNow = new Date()
        spyOn(window, "Date").and.callFake(() => {
            return dateNow
        })
        let limsid = "FAKE_ID"
        service.userInfo.limsid = limsid
        let suspendRemark = "FAKE_SUSPEND_REMARK"
        spyOn(service.entityService, "update").and.callFake((_sample) => {
            return Observable.of(_sample)
        })
        let sample = {
            "SYS_SAMPLE_CODE": "1",
        }

        // SUSPEND
        let suspension = {}
        service.suspendSample(sample, suspendRemark)
        .subscribe(sample => {
            suspension = sample['SYS_SUSPENSION']
            expect(suspension['DATE']).toBe(dateNow)
            expect(suspension['OPERATOR']).toBe(limsid)
            expect(suspension['REMARK']).toBe(suspendRemark)
        })

        // RESUME
        let resumeRemark = "FAKE_RESUME_REMARK"
        service.resumeSample(sample, resumeRemark)
        .subscribe(sample => {
            let resumption = sample['SYS_RESUMPTION'][sample['SYS_RESUMPTION'].length - 1]
            let suspensionShot = resumption['SUSPENSION']
            expect(resumption['DATE']).toBe(dateNow)
            expect(resumption['OPERATOR']).toBe(limsid)
            expect(resumption['REMARK']).toBe(resumeRemark)
            expect(sample['SYS_SUSPENSION']).toBeNull()
            expect(suspensionShot).toBe(suspension)
            done()
        })
    })// }}}

    // isSuspended{{{
    it('TEST: isSuspended', done => {
        let sampleA = {
            SYS_SAMPLE_CODE: "1",
        }
        let sampleAList = [
            sampleA,
            {
                id: "A-1",
                SYS_SUSPENSION: {},
            },
            {
                id: "A-2",
            },
        ]
        let sampleB = {
            SYS_SAMPLE_CODE: "2",
        }
        let sampleBList = [
            sampleB,
            {
                id: "B-1",
                SYS_SUSPENSION: null,
            },
            {
                id: "B-2",
                SYS_SUSPENSION: {
                    OPERATOR: "FAKE_OPERATOR",
                },
            },
        ]
        spyOn(service.entityService, "retrieveBy").and.returnValues(
            Observable.of(sampleAList),
            Observable.of(sampleBList),
        )
        service.isSuspended(sampleA.SYS_SAMPLE_CODE)
        .subscribe(result => {
            expect(result).toBeFalsy()
        })
        service.isSuspended(sampleB.SYS_SAMPLE_CODE)
        .subscribe(result => {
            expect(result).toBeTruthy()
            done()
        })
    })// }}}

    // sendMessageDingtalk with 2 samples{{{
    it('TEST: sendMessageDingtalk with submitted 2 samples', done => {
        let selectedSampleList = [
            {
            }
        ]
        let submittedSampleList = [
            {
                "TMP_CODE": "DNA_EXTRACTION.20180409105857",
                "SYS_ENTITY_TYPE": "collection",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "SYS_WORKCENTER_OPERATOR": "5ab88e01d98a70566c707c64",
                "CONF_DNA_EXTRACTION_NANODROP": 1,
                "CONF_DNA_EXTRACTION_OD230": 2.3,
                "CONF_DNA_EXTRACTION_EXTRACT_DATE": "2018-04-13"
            },
            {
                "TMP_CODE": "DNA_EXTRACTION.20180409105857",
                "SYS_ENTITY_TYPE": "collection",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "SYS_WORKCENTER_OPERATOR": "5ab88e01d98a70566c707c64",
                "CONF_DNA_EXTRACTION_NANODROP": 1,
                "CONF_DNA_EXTRACTION_OD230": 2.3,
                "CONF_DNA_EXTRACTION_EXTRACT_DATE": "2018-04-13"
            }
        ]


        let attributeList = [
            {
                "_id": "5ab88e01d98a70566c707cc2",
                "label": "Nanodrop ng/ul",
                "SYS_CODE": "CONF_DNA_EXTRACTION_NANODROP",
                "SYS_TYPE": "number",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.966Z",
                "createdAt": "2018-03-26T06:06:57.966Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 10,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cc2"
            },
            {
                "_id": "5ab88e01d98a70566c707cc3",
                "label": "Qubit ng/ul",
                "SYS_CODE": "CONF_DNA_EXTRACTION_QUBIT",
                "SYS_TYPE": "number",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.967Z",
                "createdAt": "2018-03-26T06:06:57.967Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 20,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cc3"
            },
            {
                "_id": "5ab88e01d98a70566c707cc4",
                "label": "OD 260/230",
                "SYS_CODE": "CONF_DNA_EXTRACTION_OD230",
                "SYS_TYPE": "number",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.968Z",
                "createdAt": "2018-03-26T06:06:57.968Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 30,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cc4"
            },
            {
                "_id": "5ab88e01d98a70566c707cc5",
                "label": "OD 260/280",
                "SYS_CODE": "CONF_DNA_EXTRACTION_OD280",
                "SYS_TYPE": "number",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.968Z",
                "createdAt": "2018-03-26T06:06:57.968Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 40,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cc5"
            },
            {
                "_id": "5ab88e01d98a70566c707cc6",
                "label": "样品体积(ul)",
                "SYS_CODE": "CONF_DNA_EXTRACTION_VOLUME",
                "SYS_TYPE": "number",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.969Z",
                "createdAt": "2018-03-26T06:06:57.969Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 50,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cc6"
            },
            {
                "_id": "5ab88e01d98a70566c707cc7",
                "label": "样品总量(ng)",
                "SYS_CODE": "CONF_DNA_EXTRACTION_AMOUNT",
                "SYS_TYPE": "number",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.970Z",
                "createdAt": "2018-03-26T06:06:57.970Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 60,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cc7"
            },
            {
                "_id": "5ab88e01d98a70566c707cc8",
                "label": "质检结论",
                "SYS_CODE": "CONF_DNA_EXTRACTION_QC_RESULT",
                "SYS_TYPE": "list",
                "SYS_TYPE_LIST": "A:A,B:B,Ca:C-a,Cb:C-b,Cd:C-d,D:D",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.970Z",
                "createdAt": "2018-03-26T06:06:57.970Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 90,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cc8"
            },
            {
                "_id": "5ab88e01d98a70566c707cc9",
                "label": "质检备注",
                "SYS_CODE": "CONF_DNA_EXTRACTION_QC_REMARK",
                "SYS_TYPE": "list",
                "SYS_TYPE_LIST": "1:合格,0:只电泳检测,-1:不合格",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.972Z",
                "createdAt": "2018-03-26T06:06:57.972Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 100,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cc9"
            },
            {
                "_id": "5ab88e01d98a70566c707cca",
                "label": "样品提取时间",
                "SYS_CODE": "CONF_DNA_EXTRACTION_EXTRACT_DATE",
                "SYS_TYPE": "date",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.973Z",
                "createdAt": "2018-03-26T06:06:57.973Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 110,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cca"
            },
            {
                "_id": "5ab88e01d98a70566c707ccb",
                "label": "质检完成时间",
                "SYS_CODE": "CONF_DNA_EXTRACTION_QC_COMPLETE_DATE",
                "SYS_TYPE": "date",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.973Z",
                "createdAt": "2018-03-26T06:06:57.973Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 120,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707ccb"
            },
            {
                "_id": "5ab88e01d98a70566c707ccc",
                "label": "备注(DNA提取来源)",
                "SYS_CODE": "CONF_DNA_EXTRACTION_REMARK",
                "SYS_TYPE": "string",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.973Z",
                "createdAt": "2018-03-26T06:06:57.973Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 130,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707ccc"
            },
            {
                "_id": "5ab88e01d98a70566c707ccd",
                "label": "操作人",
                "SYS_CODE": "SYS_WORKCENTER_OPERATOR",
                "SYS_TYPE": "entity",
                "SYS_TYPE_ENTITY": {
                    "_id": "5ab88e01d98a70566c707c5c",
                    "SYS_IDENTIFIER": "/HUMAN_RESOURCE/IGENETECH",
                    "SYS_ENTITY_TYPE": "class",
                    "SYS_GENRE": "5ab88e01d98a70566c707c5b",
                    "label": "Staff",
                    "__v": 0,
                    "updatedAt": "2018-03-26T06:06:57.701Z",
                    "createdAt": "2018-03-26T06:06:57.701Z",
                    "SYS_PARENT_LIST": [],
                    "SYS_LABEL": "label",
                    "SYS_GENRE_IDENTIFIER": "/HUMAN_RESOURCE/",
                    "SYS_CODE": "IGENETECH",
                    "id": "5ab88e01d98a70566c707c5c"
                },
                "SYS_FLOOR_ENTITY_TYPE": "collection",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.975Z",
                "createdAt": "2018-03-26T06:06:57.975Z",
                "SYS_TYPE_ENTITY_REF": true,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 140,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707ccd"
            },
            {
                "_id": "5ab88e01d98a70566c707cce",
                "label": "操作日期",
                "SYS_CODE": "SYS_DATE_COMPLETED",
                "SYS_TYPE": "date",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.975Z",
                "createdAt": "2018-03-26T06:06:57.975Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 150,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cce"
            },
            {
                "_id": "5ab88e01d98a70566c707cc1",
                "label": "BoM",
                "SYS_CODE": "BOM",
                "SYS_TYPE": "entity",
                "SYS_TYPE_ENTITY": {
                    "_id": "5ab88e01d98a70566c707c95",
                    "SYS_IDENTIFIER": "/BOM/MANUFACTURING/EXTRACT_V1",
                    "SYS_ENTITY_TYPE": "collection",
                    "SYS_GENRE": "5ab88e01d98a70566c707c94",
                    "label": "Extract V1 Manufacturing BoMs",
                    "__v": 0,
                    "updatedAt": "2018-03-26T06:06:57.938Z",
                    "createdAt": "2018-03-26T06:06:57.938Z",
                    "SYS_PARENT_LIST": [],
                    "SYS_LABEL": "label",
                    "SYS_GENRE_IDENTIFIER": "/BOM/MANUFACTURING/",
                    "SYS_CODE": "EXTRACT_V1",
                    "id": "5ab88e01d98a70566c707c95"
                },
                "SYS_FLOOR_ENTITY_TYPE": "collection",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.966Z",
                "createdAt": "2018-03-26T06:06:57.966Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 500,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cc1"
            }
        ]

        let targetOutputList = [
            [
                {
                    "workcenter": {
                        "_id": "5ab88e01d98a70566c707c83",
                        "SYS_IDENTIFIER": "/MATERIAL/KAPA_HIFI/LOT170312",
                        "SYS_ENTITY_TYPE": "collection",
                        "SYS_GENRE": "5ab88e01d98a70566c707c81",
                        "label": "LOT170312",
                        "__v": 0,
                        "SYS_GENRE_IDENTIFIER": "/MATERIAL/KAPA_HIFI/",
                        "SYS_CODE": "LOT170312",
                        "id": "5ab88e01d98a70566c707c83",
                        "SYS_SCHEMA": [],
                        "updatedAt": "2018-03-26T06:06:57.928Z",
                        "createdAt": "2018-03-26T06:06:57.928Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label"
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0011",
                        "SYS_TARGET": "5ac19eaf6c208011bc40679f",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0011_1523242792316",
                        "SYS_IDENTIFIER": "/MATERIAL/KAPA_HIFI/LOT170312/18R0011.20180402110831.1522638511070.3684.1523242792577.7473",
                        "SYS_ENTITY_TYPE": "object",
                        "SYS_GENRE": "5ab88e01d98a70566c707c81",
                        "SYS_CHECKED": true,
                        "SYS_SOURCE": "5ab88e01d98a70566c707c83",
                        "SYS_QUANTITY": 2.1,
                        "REMARK": "kapa remark",
                        "SYS_FLOOR_ENTITY_TYPE": "collection",
                        "SYS_DATE_SCHEDULED": "2018-04-02T03:08:31.246Z",
                        "SYS_DATE_ARRIVED": "2018-04-02T03:08:31.246Z"
                    }
                },
                {
                    "workcenter": {
                        "_id": "5ab88e01d98a70566c707c8c",
                        "SYS_IDENTIFIER": "/MATERIAL/TIP/Tip_1",
                        "SYS_ENTITY_TYPE": "collection",
                        "SYS_GENRE": "5ab88e01d98a70566c707c8b",
                        "label": "Tip#1",
                        "__v": 0,
                        "updatedAt": "2018-03-26T06:06:57.933Z",
                        "createdAt": "2018-03-26T06:06:57.933Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label",
                        "SYS_GENRE_IDENTIFIER": "/MATERIAL/TIP/",
                        "SYS_CODE": "Tip_1",
                        "id": "5ab88e01d98a70566c707c8c",
                        "SYS_SCHEMA": []
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0011",
                        "SYS_TARGET": "5ac19eaf6c208011bc40679f",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0011_1523242792316",
                        "SYS_IDENTIFIER": "/MATERIAL/TIP/Tip_1/18R0011.20180402110831.1522638511070.3684.1523242792618.4944",
                        "SYS_ENTITY_TYPE": "object",
                        "SYS_GENRE": "5ab88e01d98a70566c707c8b",
                        "SYS_CHECKED": true,
                        "SYS_SOURCE": "5ab88e01d98a70566c707c8a",
                        "SYS_QUANTITY": 2,
                        "REMARK": "初始化生成",
                        "SYS_FLOOR_ENTITY_TYPE": "collection",
                        "SYS_DATE_SCHEDULED": "2018-04-02T03:08:31.246Z"
                    }
                }
            ],
            [
                {
                    "workcenter": {
                        "_id": "5ab88e01d98a70566c707c83",
                        "SYS_IDENTIFIER": "/MATERIAL/KAPA_HIFI/LOT170312",
                        "SYS_ENTITY_TYPE": "collection",
                        "SYS_GENRE": "5ab88e01d98a70566c707c81",
                        "label": "LOT170312",
                        "__v": 0,
                        "SYS_GENRE_IDENTIFIER": "/MATERIAL/KAPA_HIFI/",
                        "SYS_CODE": "LOT170312",
                        "id": "5ab88e01d98a70566c707c83",
                        "SYS_SCHEMA": [],
                        "updatedAt": "2018-03-26T06:06:57.928Z",
                        "createdAt": "2018-03-26T06:06:57.928Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label"
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0012",
                        "SYS_TARGET": "5ac19eaf6c208011bc4067a7",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0012_1523242792328",
                        "SYS_IDENTIFIER": "/MATERIAL/KAPA_HIFI/LOT170312/18R0012.20180402110831.1522638511256.4565.1523242792643.3523",
                        "SYS_ENTITY_TYPE": "object",
                        "SYS_GENRE": "5ab88e01d98a70566c707c81",
                        "SYS_CHECKED": true,
                        "SYS_SOURCE": "5ab88e01d98a70566c707c83",
                        "SYS_QUANTITY": 2.1,
                        "REMARK": "kapa remark",
                        "SYS_FLOOR_ENTITY_TYPE": "collection",
                        "SYS_DATE_SCHEDULED": "2018-04-02T03:08:31.246Z",
                        "SYS_DATE_ARRIVED": "2018-04-02T03:08:31.246Z"
                    }
                },
                {
                    "workcenter": {
                        "_id": "5ab88e01d98a70566c707c8c",
                        "SYS_IDENTIFIER": "/MATERIAL/TIP/Tip_1",
                        "SYS_ENTITY_TYPE": "collection",
                        "SYS_GENRE": "5ab88e01d98a70566c707c8b",
                        "label": "Tip#1",
                        "__v": 0,
                        "updatedAt": "2018-03-26T06:06:57.933Z",
                        "createdAt": "2018-03-26T06:06:57.933Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label",
                        "SYS_GENRE_IDENTIFIER": "/MATERIAL/TIP/",
                        "SYS_CODE": "Tip_1",
                        "id": "5ab88e01d98a70566c707c8c",
                        "SYS_SCHEMA": []
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0012",
                        "SYS_TARGET": "5ac19eaf6c208011bc4067a7",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0012_1523242792328",
                        "SYS_IDENTIFIER": "/MATERIAL/TIP/Tip_1/18R0012.20180402110831.1522638511256.4565.1523242792672.9944",
                        "SYS_ENTITY_TYPE": "object",
                        "SYS_GENRE": "5ab88e01d98a70566c707c8b",
                        "SYS_CHECKED": true,
                        "SYS_SOURCE": "5ab88e01d98a70566c707c8a",
                        "SYS_QUANTITY": 2,
                        "REMARK": "初始化生成",
                        "SYS_FLOOR_ENTITY_TYPE": "collection",
                        "SYS_DATE_SCHEDULED": "2018-04-02T03:08:31.246Z"
                    }
                }
            ]
        ]

        let output = `
        # **18R0011**

        undefined | undefined

        submitted as:

        >- Nanodrop ng/ul: 1

        >- OD 260/230: 2.3

        >- 样品提取时间: 2018-04-13

        >- 操作人: 5ab88e01d98a70566c707c64

        materials:

        >- LOT170312: 2.1

        >- Tip#1: 2

        # **18R0012**

        undefined | undefined

        submitted as:

        >- Nanodrop ng/ul: 1

        >- OD 260/230: 2.3

        >- 样品提取时间: 2018-04-13

        >- 操作人: 5ab88e01d98a70566c707c64

        materials:

        >- LOT170312: 2.1

        >- Tip#1: 2

        > 

        吴洋

        2018-4-9 10:59
        `

    })// }}}

    // sendMessageDingtalk with 5 samples{{{
    it('TEST: sendMessageDingtalk with submitted 5 samples', done => {
        let selectedSampleList = [
            {
            }
        ]
        let submittedSampleList = [
            {
                "TMP_CODE": "DNA_EXTRACTION.20180409111449",
                "SYS_ENTITY_TYPE": "collection",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "SYS_WORKCENTER_OPERATOR": "5ab88e01d98a70566c707c64",
                "CONF_DNA_EXTRACTION_OD230": 2.3,
                "CONF_DNA_EXTRACTION_QC_RESULT": "Ca",
                "CONF_DNA_EXTRACTION_EXTRACT_DATE": "2018-04-19"
            },
            {
                "TMP_CODE": "DNA_EXTRACTION.20180409111449",
                "SYS_ENTITY_TYPE": "collection",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "SYS_WORKCENTER_OPERATOR": "5ab88e01d98a70566c707c64",
                "CONF_DNA_EXTRACTION_OD230": 2.3,
                "CONF_DNA_EXTRACTION_QC_RESULT": "Ca",
                "CONF_DNA_EXTRACTION_EXTRACT_DATE": "2018-04-19"
            },
            {
                "TMP_CODE": "DNA_EXTRACTION.20180409111449",
                "SYS_ENTITY_TYPE": "collection",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "SYS_WORKCENTER_OPERATOR": "5ab88e01d98a70566c707c64",
                "CONF_DNA_EXTRACTION_OD230": 2.3,
                "CONF_DNA_EXTRACTION_QC_RESULT": "Ca",
                "CONF_DNA_EXTRACTION_EXTRACT_DATE": "2018-04-19"
            },
            {
                "TMP_CODE": "DNA_EXTRACTION.20180409111449",
                "SYS_ENTITY_TYPE": "collection",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "SYS_WORKCENTER_OPERATOR": "5ab88e01d98a70566c707c64",
                "CONF_DNA_EXTRACTION_OD230": 2.3,
                "CONF_DNA_EXTRACTION_QC_RESULT": "Ca",
                "CONF_DNA_EXTRACTION_EXTRACT_DATE": "2018-04-19"
            },
            {
                "TMP_CODE": "DNA_EXTRACTION.20180409111449",
                "SYS_ENTITY_TYPE": "collection",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "SYS_WORKCENTER_OPERATOR": "5ab88e01d98a70566c707c64",
                "CONF_DNA_EXTRACTION_OD230": 2.3,
                "CONF_DNA_EXTRACTION_QC_RESULT": "Ca",
                "CONF_DNA_EXTRACTION_EXTRACT_DATE": "2018-04-19"
            }
        ]
        let attributeList = [
            {
                "_id": "5ab88e01d98a70566c707cc2",
                "label": "Nanodrop ng/ul",
                "SYS_CODE": "CONF_DNA_EXTRACTION_NANODROP",
                "SYS_TYPE": "number",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.966Z",
                "createdAt": "2018-03-26T06:06:57.966Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 10,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cc2"
            },
            {
                "_id": "5ab88e01d98a70566c707cc3",
                "label": "Qubit ng/ul",
                "SYS_CODE": "CONF_DNA_EXTRACTION_QUBIT",
                "SYS_TYPE": "number",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.967Z",
                "createdAt": "2018-03-26T06:06:57.967Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 20,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cc3"
            },
            {
                "_id": "5ab88e01d98a70566c707cc4",
                "label": "OD 260/230",
                "SYS_CODE": "CONF_DNA_EXTRACTION_OD230",
                "SYS_TYPE": "number",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.968Z",
                "createdAt": "2018-03-26T06:06:57.968Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 30,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cc4"
            },
            {
                "_id": "5ab88e01d98a70566c707cc5",
                "label": "OD 260/280",
                "SYS_CODE": "CONF_DNA_EXTRACTION_OD280",
                "SYS_TYPE": "number",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.968Z",
                "createdAt": "2018-03-26T06:06:57.968Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 40,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cc5"
            },
            {
                "_id": "5ab88e01d98a70566c707cc6",
                "label": "样品体积(ul)",
                "SYS_CODE": "CONF_DNA_EXTRACTION_VOLUME",
                "SYS_TYPE": "number",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.969Z",
                "createdAt": "2018-03-26T06:06:57.969Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 50,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cc6"
            },
            {
                "_id": "5ab88e01d98a70566c707cc7",
                "label": "样品总量(ng)",
                "SYS_CODE": "CONF_DNA_EXTRACTION_AMOUNT",
                "SYS_TYPE": "number",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.970Z",
                "createdAt": "2018-03-26T06:06:57.970Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 60,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cc7"
            },
            {
                "_id": "5ab88e01d98a70566c707cc8",
                "label": "质检结论",
                "SYS_CODE": "CONF_DNA_EXTRACTION_QC_RESULT",
                "SYS_TYPE": "list",
                "SYS_TYPE_LIST": "A:A,B:B,Ca:C-a,Cb:C-b,Cd:C-d,D:D",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.970Z",
                "createdAt": "2018-03-26T06:06:57.970Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 90,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cc8"
            },
            {
                "_id": "5ab88e01d98a70566c707cc9",
                "label": "质检备注",
                "SYS_CODE": "CONF_DNA_EXTRACTION_QC_REMARK",
                "SYS_TYPE": "list",
                "SYS_TYPE_LIST": "1:合格,0:只电泳检测,-1:不合格",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.972Z",
                "createdAt": "2018-03-26T06:06:57.972Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 100,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cc9"
            },
            {
                "_id": "5ab88e01d98a70566c707cca",
                "label": "样品提取时间",
                "SYS_CODE": "CONF_DNA_EXTRACTION_EXTRACT_DATE",
                "SYS_TYPE": "date",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.973Z",
                "createdAt": "2018-03-26T06:06:57.973Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 110,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cca"
            },
            {
                "_id": "5ab88e01d98a70566c707ccb",
                "label": "质检完成时间",
                "SYS_CODE": "CONF_DNA_EXTRACTION_QC_COMPLETE_DATE",
                "SYS_TYPE": "date",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.973Z",
                "createdAt": "2018-03-26T06:06:57.973Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 120,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707ccb"
            },
            {
                "_id": "5ab88e01d98a70566c707ccc",
                "label": "备注(DNA提取来源)",
                "SYS_CODE": "CONF_DNA_EXTRACTION_REMARK",
                "SYS_TYPE": "string",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.973Z",
                "createdAt": "2018-03-26T06:06:57.973Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 130,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707ccc"
            },
            {
                "_id": "5ab88e01d98a70566c707ccd",
                "label": "操作人",
                "SYS_CODE": "SYS_WORKCENTER_OPERATOR",
                "SYS_TYPE": "entity",
                "SYS_TYPE_ENTITY": {
                    "_id": "5ab88e01d98a70566c707c5c",
                    "SYS_IDENTIFIER": "/HUMAN_RESOURCE/IGENETECH",
                    "SYS_ENTITY_TYPE": "class",
                    "SYS_GENRE": "5ab88e01d98a70566c707c5b",
                    "label": "Staff",
                    "__v": 0,
                    "updatedAt": "2018-03-26T06:06:57.701Z",
                    "createdAt": "2018-03-26T06:06:57.701Z",
                    "SYS_PARENT_LIST": [],
                    "SYS_LABEL": "label",
                    "SYS_GENRE_IDENTIFIER": "/HUMAN_RESOURCE/",
                    "SYS_CODE": "IGENETECH",
                    "id": "5ab88e01d98a70566c707c5c"
                },
                "SYS_FLOOR_ENTITY_TYPE": "collection",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.975Z",
                "createdAt": "2018-03-26T06:06:57.975Z",
                "SYS_TYPE_ENTITY_REF": true,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 140,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707ccd"
            },
            {
                "_id": "5ab88e01d98a70566c707cce",
                "label": "操作日期",
                "SYS_CODE": "SYS_DATE_COMPLETED",
                "SYS_TYPE": "date",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.975Z",
                "createdAt": "2018-03-26T06:06:57.975Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 150,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cce"
            },
            {
                "_id": "5ab88e01d98a70566c707cc1",
                "label": "BoM",
                "SYS_CODE": "BOM",
                "SYS_TYPE": "entity",
                "SYS_TYPE_ENTITY": {
                    "_id": "5ab88e01d98a70566c707c95",
                    "SYS_IDENTIFIER": "/BOM/MANUFACTURING/EXTRACT_V1",
                    "SYS_ENTITY_TYPE": "collection",
                    "SYS_GENRE": "5ab88e01d98a70566c707c94",
                    "label": "Extract V1 Manufacturing BoMs",
                    "__v": 0,
                    "updatedAt": "2018-03-26T06:06:57.938Z",
                    "createdAt": "2018-03-26T06:06:57.938Z",
                    "SYS_PARENT_LIST": [],
                    "SYS_LABEL": "label",
                    "SYS_GENRE_IDENTIFIER": "/BOM/MANUFACTURING/",
                    "SYS_CODE": "EXTRACT_V1",
                    "id": "5ab88e01d98a70566c707c95"
                },
                "SYS_FLOOR_ENTITY_TYPE": "collection",
                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.966Z",
                "createdAt": "2018-03-26T06:06:57.966Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 500,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cc1"
            }
        ]
        let targetOutputList = [
            [
                {
                    "workcenter": {
                        "_id": "5ab88e01d98a70566c707c83",
                        "SYS_IDENTIFIER": "/MATERIAL/KAPA_HIFI/LOT170312",
                        "SYS_ENTITY_TYPE": "collection",
                        "SYS_GENRE": "5ab88e01d98a70566c707c81",
                        "label": "LOT170312",
                        "__v": 0,
                        "SYS_GENRE_IDENTIFIER": "/MATERIAL/KAPA_HIFI/",
                        "SYS_CODE": "LOT170312",
                        "id": "5ab88e01d98a70566c707c83",
                        "SYS_SCHEMA": [],
                        "updatedAt": "2018-03-26T06:06:57.928Z",
                        "createdAt": "2018-03-26T06:06:57.928Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label"
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0009",
                        "SYS_TARGET": "5ac19eae6c208011bc40678f",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0009_1523243716259",
                        "SYS_IDENTIFIER": "/MATERIAL/KAPA_HIFI/LOT170312/18R0009.20180402110830.1522638510612.0252.1523243716702.0056",
                        "SYS_ENTITY_TYPE": "object",
                        "SYS_GENRE": "5ab88e01d98a70566c707c81",
                        "SYS_CHECKED": true,
                        "SYS_SOURCE": "5ab88e01d98a70566c707c83",
                        "SYS_QUANTITY": 20,
                        "REMARK": "test1",
                        "SYS_FLOOR_ENTITY_TYPE": "collection",
                        "SYS_DATE_SCHEDULED": "2018-04-02T03:08:31.428Z",
                        "SYS_DATE_ARRIVED": "2018-04-02T03:08:31.428Z"
                    }
                },
                {
                    "workcenter": {
                        "_id": "5ab88e01d98a70566c707c8c",
                        "SYS_IDENTIFIER": "/MATERIAL/TIP/Tip_1",
                        "SYS_ENTITY_TYPE": "collection",
                        "SYS_GENRE": "5ab88e01d98a70566c707c8b",
                        "label": "Tip#1",
                        "__v": 0,
                        "updatedAt": "2018-03-26T06:06:57.933Z",
                        "createdAt": "2018-03-26T06:06:57.933Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label",
                        "SYS_GENRE_IDENTIFIER": "/MATERIAL/TIP/",
                        "SYS_CODE": "Tip_1",
                        "id": "5ab88e01d98a70566c707c8c",
                        "SYS_SCHEMA": []
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0009",
                        "SYS_TARGET": "5ac19eae6c208011bc40678f",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0009_1523243716259",
                        "SYS_IDENTIFIER": "/MATERIAL/TIP/Tip_1/18R0009.20180402110830.1522638510612.0252.1523243716837.8842",
                        "SYS_ENTITY_TYPE": "object",
                        "SYS_GENRE": "5ab88e01d98a70566c707c8b",
                        "SYS_CHECKED": true,
                        "SYS_SOURCE": "5ab88e01d98a70566c707c8a",
                        "SYS_QUANTITY": 2,
                        "REMARK": "初始化生成",
                        "SYS_FLOOR_ENTITY_TYPE": "collection",
                        "SYS_DATE_SCHEDULED": "2018-04-02T03:08:31.428Z"
                    }
                }
            ],
            [
                {
                    "workcenter": {
                        "_id": "5ab88e01d98a70566c707c83",
                        "SYS_IDENTIFIER": "/MATERIAL/KAPA_HIFI/LOT170312",
                        "SYS_ENTITY_TYPE": "collection",
                        "SYS_GENRE": "5ab88e01d98a70566c707c81",
                        "label": "LOT170312",
                        "__v": 0,
                        "SYS_GENRE_IDENTIFIER": "/MATERIAL/KAPA_HIFI/",
                        "SYS_CODE": "LOT170312",
                        "id": "5ab88e01d98a70566c707c83",
                        "SYS_SCHEMA": [],
                        "updatedAt": "2018-03-26T06:06:57.928Z",
                        "createdAt": "2018-03-26T06:06:57.928Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label"
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0010",
                        "SYS_TARGET": "5ac19eae6c208011bc406797",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0010_1523243716278",
                        "SYS_IDENTIFIER": "/MATERIAL/KAPA_HIFI/LOT170312/18R0010.20180402110830.1522638510880.1309.1523243716723.7736",
                        "SYS_ENTITY_TYPE": "object",
                        "SYS_GENRE": "5ab88e01d98a70566c707c81",
                        "SYS_CHECKED": true,
                        "SYS_SOURCE": "5ab88e01d98a70566c707c83",
                        "SYS_QUANTITY": 20,
                        "REMARK": "test1",
                        "SYS_FLOOR_ENTITY_TYPE": "collection",
                        "SYS_DATE_SCHEDULED": "2018-04-02T03:08:31.428Z",
                        "SYS_DATE_ARRIVED": "2018-04-02T03:08:31.428Z"
                    }
                },
                {
                    "workcenter": {
                        "_id": "5ab88e01d98a70566c707c8c",
                        "SYS_IDENTIFIER": "/MATERIAL/TIP/Tip_1",
                        "SYS_ENTITY_TYPE": "collection",
                        "SYS_GENRE": "5ab88e01d98a70566c707c8b",
                        "label": "Tip#1",
                        "__v": 0,
                        "updatedAt": "2018-03-26T06:06:57.933Z",
                        "createdAt": "2018-03-26T06:06:57.933Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label",
                        "SYS_GENRE_IDENTIFIER": "/MATERIAL/TIP/",
                        "SYS_CODE": "Tip_1",
                        "id": "5ab88e01d98a70566c707c8c",
                        "SYS_SCHEMA": []
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0010",
                        "SYS_TARGET": "5ac19eae6c208011bc406797",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0010_1523243716278",
                        "SYS_IDENTIFIER": "/MATERIAL/TIP/Tip_1/18R0010.20180402110830.1522638510880.1309.1523243716870.6778",
                        "SYS_ENTITY_TYPE": "object",
                        "SYS_GENRE": "5ab88e01d98a70566c707c8b",
                        "SYS_CHECKED": true,
                        "SYS_SOURCE": "5ab88e01d98a70566c707c8a",
                        "SYS_QUANTITY": 2,
                        "REMARK": "初始化生成",
                        "SYS_FLOOR_ENTITY_TYPE": "collection",
                        "SYS_DATE_SCHEDULED": "2018-04-02T03:08:31.428Z"
                    }
                }
            ],
            [
                {
                    "workcenter": {
                        "_id": "5ab88e01d98a70566c707c83",
                        "SYS_IDENTIFIER": "/MATERIAL/KAPA_HIFI/LOT170312",
                        "SYS_ENTITY_TYPE": "collection",
                        "SYS_GENRE": "5ab88e01d98a70566c707c81",
                        "label": "LOT170312",
                        "__v": 0,
                        "SYS_GENRE_IDENTIFIER": "/MATERIAL/KAPA_HIFI/",
                        "SYS_CODE": "LOT170312",
                        "id": "5ab88e01d98a70566c707c83",
                        "SYS_SCHEMA": [],
                        "updatedAt": "2018-03-26T06:06:57.928Z",
                        "createdAt": "2018-03-26T06:06:57.928Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label"
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0011",
                        "SYS_TARGET": "5ac19eaf6c208011bc40679f",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0011_1523243716323",
                        "SYS_IDENTIFIER": "/MATERIAL/KAPA_HIFI/LOT170312/18R0011.20180402110831.1522638511070.3684.1523243716774.0327",
                        "SYS_ENTITY_TYPE": "object",
                        "SYS_GENRE": "5ab88e01d98a70566c707c81",
                        "SYS_CHECKED": true,
                        "SYS_SOURCE": "5ab88e01d98a70566c707c83",
                        "SYS_QUANTITY": 20,
                        "REMARK": "test1",
                        "SYS_FLOOR_ENTITY_TYPE": "collection",
                        "SYS_DATE_SCHEDULED": "2018-04-02T03:08:31.428Z",
                        "SYS_DATE_ARRIVED": "2018-04-02T03:08:31.428Z"
                    }
                },
                {
                    "workcenter": {
                        "_id": "5ab88e01d98a70566c707c8c",
                        "SYS_IDENTIFIER": "/MATERIAL/TIP/Tip_1",
                        "SYS_ENTITY_TYPE": "collection",
                        "SYS_GENRE": "5ab88e01d98a70566c707c8b",
                        "label": "Tip#1",
                        "__v": 0,
                        "updatedAt": "2018-03-26T06:06:57.933Z",
                        "createdAt": "2018-03-26T06:06:57.933Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label",
                        "SYS_GENRE_IDENTIFIER": "/MATERIAL/TIP/",
                        "SYS_CODE": "Tip_1",
                        "id": "5ab88e01d98a70566c707c8c",
                        "SYS_SCHEMA": []
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0011",
                        "SYS_TARGET": "5ac19eaf6c208011bc40679f",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0011_1523243716323",
                        "SYS_IDENTIFIER": "/MATERIAL/TIP/Tip_1/18R0011.20180402110831.1522638511070.3684.1523243716938.6752",
                        "SYS_ENTITY_TYPE": "object",
                        "SYS_GENRE": "5ab88e01d98a70566c707c8b",
                        "SYS_CHECKED": true,
                        "SYS_SOURCE": "5ab88e01d98a70566c707c8a",
                        "SYS_QUANTITY": 2,
                        "REMARK": "初始化生成",
                        "SYS_FLOOR_ENTITY_TYPE": "collection",
                        "SYS_DATE_SCHEDULED": "2018-04-02T03:08:31.428Z"
                    }
                }
            ],
            [
                {
                    "workcenter": {
                        "_id": "5ab88e01d98a70566c707c83",
                        "SYS_IDENTIFIER": "/MATERIAL/KAPA_HIFI/LOT170312",
                        "SYS_ENTITY_TYPE": "collection",
                        "SYS_GENRE": "5ab88e01d98a70566c707c81",
                        "label": "LOT170312",
                        "__v": 0,
                        "SYS_GENRE_IDENTIFIER": "/MATERIAL/KAPA_HIFI/",
                        "SYS_CODE": "LOT170312",
                        "id": "5ab88e01d98a70566c707c83",
                        "SYS_SCHEMA": [],
                        "updatedAt": "2018-03-26T06:06:57.928Z",
                        "createdAt": "2018-03-26T06:06:57.928Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label"
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0012",
                        "SYS_TARGET": "5ac19eaf6c208011bc4067a7",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0012_1523243716299",
                        "SYS_IDENTIFIER": "/MATERIAL/KAPA_HIFI/LOT170312/18R0012.20180402110831.1522638511256.4565.1523243716751.9680",
                        "SYS_ENTITY_TYPE": "object",
                        "SYS_GENRE": "5ab88e01d98a70566c707c81",
                        "SYS_CHECKED": true,
                        "SYS_SOURCE": "5ab88e01d98a70566c707c83",
                        "SYS_QUANTITY": 20,
                        "REMARK": "test1",
                        "SYS_FLOOR_ENTITY_TYPE": "collection",
                        "SYS_DATE_SCHEDULED": "2018-04-02T03:08:31.428Z",
                        "SYS_DATE_ARRIVED": "2018-04-02T03:08:31.428Z"
                    }
                },
                {
                    "workcenter": {
                        "_id": "5ab88e01d98a70566c707c8c",
                        "SYS_IDENTIFIER": "/MATERIAL/TIP/Tip_1",
                        "SYS_ENTITY_TYPE": "collection",
                        "SYS_GENRE": "5ab88e01d98a70566c707c8b",
                        "label": "Tip#1",
                        "__v": 0,
                        "updatedAt": "2018-03-26T06:06:57.933Z",
                        "createdAt": "2018-03-26T06:06:57.933Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label",
                        "SYS_GENRE_IDENTIFIER": "/MATERIAL/TIP/",
                        "SYS_CODE": "Tip_1",
                        "id": "5ab88e01d98a70566c707c8c",
                        "SYS_SCHEMA": []
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0012",
                        "SYS_TARGET": "5ac19eaf6c208011bc4067a7",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0012_1523243716299",
                        "SYS_IDENTIFIER": "/MATERIAL/TIP/Tip_1/18R0012.20180402110831.1522638511256.4565.1523243716903.1197",
                        "SYS_ENTITY_TYPE": "object",
                        "SYS_GENRE": "5ab88e01d98a70566c707c8b",
                        "SYS_CHECKED": true,
                        "SYS_SOURCE": "5ab88e01d98a70566c707c8a",
                        "SYS_QUANTITY": 2,
                        "REMARK": "初始化生成",
                        "SYS_FLOOR_ENTITY_TYPE": "collection",
                        "SYS_DATE_SCHEDULED": "2018-04-02T03:08:31.428Z"
                    }
                }
            ],
            [
                {
                    "workcenter": {
                        "_id": "5ab88e01d98a70566c707c83",
                        "SYS_IDENTIFIER": "/MATERIAL/KAPA_HIFI/LOT170312",
                        "SYS_ENTITY_TYPE": "collection",
                        "SYS_GENRE": "5ab88e01d98a70566c707c81",
                        "label": "LOT170312",
                        "__v": 0,
                        "SYS_GENRE_IDENTIFIER": "/MATERIAL/KAPA_HIFI/",
                        "SYS_CODE": "LOT170312",
                        "id": "5ab88e01d98a70566c707c83",
                        "SYS_SCHEMA": [],
                        "updatedAt": "2018-03-26T06:06:57.928Z",
                        "createdAt": "2018-03-26T06:06:57.928Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label"
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0013",
                        "SYS_TARGET": "5ac19eaf6c208011bc4067af",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0013_1523243716416",
                        "SYS_IDENTIFIER": "/MATERIAL/KAPA_HIFI/LOT170312/18R0013.20180402110831.1522638511439.8182.1523243716964.2867",
                        "SYS_ENTITY_TYPE": "object",
                        "SYS_GENRE": "5ab88e01d98a70566c707c81",
                        "SYS_CHECKED": true,
                        "SYS_SOURCE": "5ab88e01d98a70566c707c83",
                        "SYS_QUANTITY": 20,
                        "REMARK": "test1",
                        "SYS_FLOOR_ENTITY_TYPE": "collection",
                        "SYS_DATE_SCHEDULED": "2018-04-02T03:08:31.428Z",
                        "SYS_DATE_ARRIVED": "2018-04-02T03:08:31.428Z"
                    }
                },
                {
                    "workcenter": {
                        "_id": "5ab88e01d98a70566c707c8c",
                        "SYS_IDENTIFIER": "/MATERIAL/TIP/Tip_1",
                        "SYS_ENTITY_TYPE": "collection",
                        "SYS_GENRE": "5ab88e01d98a70566c707c8b",
                        "label": "Tip#1",
                        "__v": 0,
                        "updatedAt": "2018-03-26T06:06:57.933Z",
                        "createdAt": "2018-03-26T06:06:57.933Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label",
                        "SYS_GENRE_IDENTIFIER": "/MATERIAL/TIP/",
                        "SYS_CODE": "Tip_1",
                        "id": "5ab88e01d98a70566c707c8c",
                        "SYS_SCHEMA": []
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0013",
                        "SYS_TARGET": "5ac19eaf6c208011bc4067af",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0013_1523243716416",
                        "SYS_IDENTIFIER": "/MATERIAL/TIP/Tip_1/18R0013.20180402110831.1522638511439.8182.1523243717167.6189",
                        "SYS_ENTITY_TYPE": "object",
                        "SYS_GENRE": "5ab88e01d98a70566c707c8b",
                        "SYS_CHECKED": true,
                        "SYS_SOURCE": "5ab88e01d98a70566c707c8a",
                        "SYS_QUANTITY": 2,
                        "REMARK": "初始化生成",
                        "SYS_FLOOR_ENTITY_TYPE": "collection",
                        "SYS_DATE_SCHEDULED": "2018-04-02T03:08:31.428Z"
                    }
                }
            ]
        ]
        let output = 
            `
        # **5** samples are submitted:

        >- 18R0009

        >- 18R0010

        >- 18R0011

        >- 18R0012

        >- 18R0013

        > 

        吴洋

        2018-4-9 11:15
        `
    })// }}}

    // sendMessageDingtalk with 1 samples{{{
    it('TEST: sendMessageDingtalk with issued 1 samples', done => {
        let sample = 
            {
            "TMP_CODE": "GENERAL_PROJECT.20180409132428",
            "SYS_ENTITY_TYPE": "collection",
            "SYS_GENRE": "5ab88e01d98a70566c707ca0",
            "SYS_LABEL": "SYS_SAMPLE_CODE",
            "SYS_WORKCENTER_OPERATOR": "5ab88e01d98a70566c707c64",
            "CONF_GENERAL_PROJECT_PROJECT_MANAGER": "testpm",
            "CONF_GENERAL_PROJECT_PROJECT_CODE": "testpmcode",
            "SYS_SAMPLE_CODE": "18R0033",
            "SYS_DATE_COMPLETED": "2018-04-09T05:24:49.340Z",
            "SYS_IDENTIFIER": "/PROJECT_MANAGEMENT/GENERAL_PROJECT/18R0033.20180409132449.2084",
            "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0033_1523251489340"
        }


        let attributeList = 
            [
            {
                "_id": "5ab88e01d98a70566c707ca1",
                "label": "序号",
                "SYS_CODE": "CONF_GENERAL_PROJECT_SERIAL_NUMBER",
                "SYS_TYPE": "string",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.945Z",
                "createdAt": "2018-03-26T06:06:57.945Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 10,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707ca1"
            },
            {
                "_id": "5ab88e01d98a70566c707ca2",
                "label": "项目负责人",
                "SYS_CODE": "CONF_GENERAL_PROJECT_PROJECT_MANAGER",
                "SYS_TYPE": "string",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.946Z",
                "createdAt": "2018-03-26T06:06:57.946Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 20,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707ca2"
            },
            {
                "_id": "5ab88e01d98a70566c707ca3",
                "label": "项目编号",
                "SYS_CODE": "CONF_GENERAL_PROJECT_PROJECT_CODE",
                "SYS_TYPE": "string",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.947Z",
                "createdAt": "2018-03-26T06:06:57.947Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 30,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707ca3"
            },
            {
                "_id": "5ab88e01d98a70566c707ca4",
                "label": "Panel名称",
                "SYS_CODE": "SYS_PANEL_CODE",
                "SYS_TYPE": "string",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.947Z",
                "createdAt": "2018-03-26T06:06:57.947Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 40,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707ca4"
            },
            {
                "_id": "5ab88e01d98a70566c707ca5",
                "label": "测序深度",
                "SYS_CODE": "CONF_GENERAL_PROJECT_DEPTH",
                "SYS_TYPE": "string",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.948Z",
                "createdAt": "2018-03-26T06:06:57.948Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 50,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707ca5"
            },
            {
                "_id": "5ab88e01d98a70566c707ca6",
                "label": "数据量",
                "SYS_CODE": "SYS_DATA_SIZE",
                "SYS_TYPE": "number",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.949Z",
                "createdAt": "2018-03-26T06:06:57.949Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 60,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707ca6"
            },
            {
                "_id": "5ab88e01d98a70566c707ca7",
                "label": "样品名称",
                "SYS_CODE": "CONF_GENERAL_PROJECT_SAMPLE_NAME",
                "SYS_TYPE": "string",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.949Z",
                "createdAt": "2018-03-26T06:06:57.949Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 70,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707ca7"
            },
            {
                "_id": "5ab88e01d98a70566c707ca8",
                "label": "样品编号",
                "SYS_CODE": "SYS_SAMPLE_CODE",
                "SYS_TYPE": "string",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.950Z",
                "createdAt": "2018-03-26T06:06:57.950Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": true,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 80,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707ca8"
            },
            {
                "_id": "5ab88e01d98a70566c707ca9",
                "label": "样品类型",
                "SYS_CODE": "CONF_GENERAL_PROJECT_SAMPLE_TYPE",
                "SYS_TYPE": "string",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.951Z",
                "createdAt": "2018-03-26T06:06:57.951Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 90,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707ca9"
            },
            {
                "_id": "5ab88e01d98a70566c707caa",
                "label": "样品物种",
                "SYS_CODE": "CONF_GENERAL_PROJECT_SAMPLE_SPECIES",
                "SYS_TYPE": "string",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.952Z",
                "createdAt": "2018-03-26T06:06:57.952Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 100,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707caa"
            },
            {
                "_id": "5ab88e01d98a70566c707cab",
                "label": "保存介质",
                "SYS_CODE": "CONF_GENERAL_PROJECT_MEDIUM",
                "SYS_TYPE": "string",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.953Z",
                "createdAt": "2018-03-26T06:06:57.953Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 110,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cab"
            },
            {
                "_id": "5ab88e01d98a70566c707cac",
                "label": "样品浓度(ng/ul)",
                "SYS_CODE": "CONF_GENERAL_PROJECT_CONC",
                "SYS_TYPE": "number",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.953Z",
                "createdAt": "2018-03-26T06:06:57.953Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 120,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cac"
            },
            {
                "_id": "5ab88e01d98a70566c707cad",
                "label": "样品体积(ul)",
                "SYS_CODE": "CONF_GENERAL_PROJECT_VOLUME",
                "SYS_TYPE": "number",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.954Z",
                "createdAt": "2018-03-26T06:06:57.954Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 130,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cad"
            },
            {
                "_id": "5ab88e01d98a70566c707cae",
                "label": "质检启动时间(液相)",
                "SYS_CODE": "CONF_GENERAL_PROJECT_QC_START_DATE",
                "SYS_TYPE": "date",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.954Z",
                "createdAt": "2018-03-26T06:06:57.954Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 140,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cae"
            },
            {
                "_id": "5ab88e01d98a70566c707caf",
                "label": "报告交付时间(液相)",
                "SYS_CODE": "CONF_GENERAL_PROJECT_REPORT_DELIVERY_DATE",
                "SYS_TYPE": "date",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.955Z",
                "createdAt": "2018-03-26T06:06:57.955Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 150,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707caf"
            },
            {
                "_id": "5ab88e01d98a70566c707cb0",
                "label": "项目预警时间(多重)",
                "SYS_CODE": "CONF_GENERAL_PROJECT_PROJECT_WARN_DATE",
                "SYS_TYPE": "date",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.956Z",
                "createdAt": "2018-03-26T06:06:57.956Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 160,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cb0"
            },
            {
                "_id": "5ab88e01d98a70566c707cb1",
                "label": "项目交付时间(多重)",
                "SYS_CODE": "CONF_GENERAL_PROJECT_PROJECT_DELIVERY_DATE",
                "SYS_TYPE": "date",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.956Z",
                "createdAt": "2018-03-26T06:06:57.956Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 170,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cb1"
            },
            {
                "_id": "5ab88e01d98a70566c707cb2",
                "label": "备注",
                "SYS_CODE": "CONF_GENERAL_PROJECT_REMARK",
                "SYS_TYPE": "string",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.957Z",
                "createdAt": "2018-03-26T06:06:57.957Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 180,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cb2"
            },
            {
                "_id": "5ab88e01d98a70566c707cb3",
                "label": "计划进度",
                "SYS_CODE": "SYS_DATE_SCHEDULED",
                "SYS_TYPE": "date",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.958Z",
                "createdAt": "2018-03-26T06:06:57.958Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 190,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cb3"
            },
            {
                "_id": "5ab88e01d98a70566c707cb4",
                "label": "操作人",
                "SYS_CODE": "SYS_WORKCENTER_OPERATOR",
                "SYS_TYPE": "entity",
                "SYS_TYPE_ENTITY": {
                    "_id": "5ab88e01d98a70566c707c5c",
                    "SYS_IDENTIFIER": "/HUMAN_RESOURCE/IGENETECH",
                    "SYS_ENTITY_TYPE": "class",
                    "SYS_GENRE": "5ab88e01d98a70566c707c5b",
                    "label": "Staff",
                    "__v": 0,
                    "updatedAt": "2018-03-26T06:06:57.701Z",
                    "createdAt": "2018-03-26T06:06:57.701Z",
                    "SYS_PARENT_LIST": [],
                    "SYS_LABEL": "label",
                    "SYS_GENRE_IDENTIFIER": "/HUMAN_RESOURCE/",
                    "SYS_CODE": "IGENETECH",
                    "id": "5ab88e01d98a70566c707c5c"
                },
                "SYS_FLOOR_ENTITY_TYPE": "collection",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.958Z",
                "createdAt": "2018-03-26T06:06:57.958Z",
                "SYS_TYPE_ENTITY_REF": true,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 200,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cb4"
            },
            {
                "_id": "5ab88e01d98a70566c707cb5",
                "label": "操作日期",
                "SYS_CODE": "SYS_DATE_COMPLETED",
                "SYS_TYPE": "date",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:57.959Z",
                "createdAt": "2018-03-26T06:06:57.959Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 210,
                "SYS_LABEL": "label",
                "id": "5ab88e01d98a70566c707cb5"
            },
            {
                "_id": "5ab88e02d98a70566c707d1e",
                "label": "Routing",
                "SYS_CODE": "ROUTING",
                "SYS_TYPE": "entity",
                "SYS_TYPE_ENTITY": {
                    "_id": "5ab88e02d98a70566c707d1d",
                    "SYS_IDENTIFIER": "/ROUTING/PRODUCT_ROUTING/ROUTING_V1",
                    "SYS_ENTITY_TYPE": "collection",
                    "PRODUCT_ROUTING_ATTR_TITLE": "Routing V1",
                    "SYS_GENRE": "5ab88e02d98a70566c707d1b",
                    "label": "Routing V1",
                    "__v": 0,
                    "updatedAt": "2018-03-26T06:06:58.025Z",
                    "createdAt": "2018-03-26T06:06:58.025Z",
                    "SYS_PARENT_LIST": [],
                    "SYS_LABEL": "PRODUCT_ROUTING_ATTR_TITLE",
                    "SYS_GENRE_IDENTIFIER": "/ROUTING/PRODUCT_ROUTING/",
                    "SYS_CODE": "ROUTING_V1",
                    "id": "5ab88e02d98a70566c707d1d"
                },
                "SYS_FLOOR_ENTITY_TYPE": "class",
                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                "__v": 0,
                "updatedAt": "2018-03-26T06:06:58.026Z",
                "createdAt": "2018-03-26T06:06:58.026Z",
                "SYS_TYPE_ENTITY_REF": false,
                "SYS_IS_ENTITY_LABEL": false,
                "SYS_REQUIRED": false,
                "SYS_ORDER": 500,
                "SYS_LABEL": "label",
                "id": "5ab88e02d98a70566c707d1e"
            }
        ]
        let targetOutputList =
            [
            [
                {
                    "workcenter": {
                        "_id": "5ab88e01d98a70566c707cbf",
                        "SYS_IDENTIFIER": "/PRODUCT_WORKCENTER/DNA_EXTRACTION",
                        "SYS_ENTITY_TYPE": "class",
                        "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                        "SYS_ORDER": 10,
                        "label": "样品提取",
                        "SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR": true,
                        "SYS_AUXILIARY_ATTRIBUTE_LIST": [
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 10,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.945Z",
                                "updatedAt": "2018-03-26T06:06:57.945Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_SERIAL_NUMBER",
                                "label": "序号",
                                "_id": "5ab88e01d98a70566c707ca1"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 20,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.946Z",
                                "updatedAt": "2018-03-26T06:06:57.946Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_PROJECT_MANAGER",
                                "label": "项目负责人",
                                "_id": "5ab88e01d98a70566c707ca2"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 30,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.947Z",
                                "updatedAt": "2018-03-26T06:06:57.947Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_PROJECT_CODE",
                                "label": "项目编号",
                                "_id": "5ab88e01d98a70566c707ca3"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 40,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.947Z",
                                "updatedAt": "2018-03-26T06:06:57.947Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_PANEL_CODE",
                                "label": "Panel名称",
                                "_id": "5ab88e01d98a70566c707ca4"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 50,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.948Z",
                                "updatedAt": "2018-03-26T06:06:57.948Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_DEPTH",
                                "label": "测序深度",
                                "_id": "5ab88e01d98a70566c707ca5"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 60,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.949Z",
                                "updatedAt": "2018-03-26T06:06:57.949Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "SYS_DATA_SIZE",
                                "label": "数据量",
                                "_id": "5ab88e01d98a70566c707ca6"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 70,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.949Z",
                                "updatedAt": "2018-03-26T06:06:57.949Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_SAMPLE_NAME",
                                "label": "样品名称",
                                "_id": "5ab88e01d98a70566c707ca7"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 80,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": true,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.950Z",
                                "updatedAt": "2018-03-26T06:06:57.950Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_SAMPLE_CODE",
                                "label": "样品编号",
                                "_id": "5ab88e01d98a70566c707ca8"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 110,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.953Z",
                                "updatedAt": "2018-03-26T06:06:57.953Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_MEDIUM",
                                "label": "保存介质",
                                "_id": "5ab88e01d98a70566c707cab"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 100,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.952Z",
                                "updatedAt": "2018-03-26T06:06:57.952Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_SAMPLE_SPECIES",
                                "label": "样品物种",
                                "_id": "5ab88e01d98a70566c707caa"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 140,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.954Z",
                                "updatedAt": "2018-03-26T06:06:57.954Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "date",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_QC_START_DATE",
                                "label": "质检启动时间(液相)",
                                "_id": "5ab88e01d98a70566c707cae"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 150,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.955Z",
                                "updatedAt": "2018-03-26T06:06:57.955Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "date",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_REPORT_DELIVERY_DATE",
                                "label": "报告交付时间(液相)",
                                "_id": "5ab88e01d98a70566c707caf"
                            }
                        ],
                        "__v": 0,
                        "SYS_GENRE_IDENTIFIER": "/PRODUCT_WORKCENTER/",
                        "SYS_CODE": "DNA_EXTRACTION",
                        "id": "5ab88e01d98a70566c707cbf",
                        "SYS_SCHEMA": [
                            {
                                "SYS_LABEL": "Order",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "SYS_ORDER"
                            },
                            {
                                "SYS_LABEL": "工作中心名称",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "label"
                            },
                            {
                                "SYS_LABEL": "Plugin: Panel Indicator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_PANEL_INDICATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Index Indicator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_INDEX_INDICATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Index Validator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Excel Processor",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Auxiliary Attribute Manager",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_ATTRIBUTE_INTRODUCER"
                            }
                        ],
                        "updatedAt": "2018-03-26T06:06:57.962Z",
                        "createdAt": "2018-03-26T06:06:57.962Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label"
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0033",
                        "SYS_TARGET": "5acaf9214421e536ebf5ec05",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0033_1523251489340",
                        "SYS_IDENTIFIER": "/PRODUCT_WORKCENTER/DNA_EXTRACTION/18R0033.20180409132449.2084.1523251489414.0873",
                        "SYS_ENTITY_TYPE": "collection",
                        "CONF_GENERAL_PROJECT_PROJECT_MANAGER": "testpm",
                        "CONF_GENERAL_PROJECT_PROJECT_CODE": "testpmcode",
                        "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                        "SYS_CHECKED": true,
                        "SYS_ORDER": 10,
                        "SYS_SOURCE": "5ab88e01d98a70566c707cbf",
                        "SYS_DURATION": 2,
                        "SYS_FLOOR_ENTITY_TYPE": "class",
                        "SYS_DATE_SCHEDULED": "2018-04-09T05:24:49.360Z",
                        "SYS_DATE_ARRIVED": "2018-04-09T05:24:49.360Z"
                    }
                },
                {
                    "workcenter": {
                        "_id": "5ab88e01d98a70566c707ccf",
                        "SYS_IDENTIFIER": "/PRODUCT_WORKCENTER/PROJECT_APPROVE",
                        "SYS_ENTITY_TYPE": "class",
                        "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                        "SYS_ORDER": 20,
                        "label": "项目审核",
                        "SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR": true,
                        "SYS_AUXILIARY_ATTRIBUTE_LIST": [
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 10,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.945Z",
                                "updatedAt": "2018-03-26T06:06:57.945Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_SERIAL_NUMBER",
                                "label": "序号",
                                "_id": "5ab88e01d98a70566c707ca1"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 20,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.946Z",
                                "updatedAt": "2018-03-26T06:06:57.946Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_PROJECT_MANAGER",
                                "label": "项目负责人",
                                "_id": "5ab88e01d98a70566c707ca2"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 30,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.947Z",
                                "updatedAt": "2018-03-26T06:06:57.947Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_PROJECT_CODE",
                                "label": "项目编号",
                                "_id": "5ab88e01d98a70566c707ca3"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 40,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.947Z",
                                "updatedAt": "2018-03-26T06:06:57.947Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_PANEL_CODE",
                                "label": "Panel名称",
                                "_id": "5ab88e01d98a70566c707ca4"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 50,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.948Z",
                                "updatedAt": "2018-03-26T06:06:57.948Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_DEPTH",
                                "label": "测序深度",
                                "_id": "5ab88e01d98a70566c707ca5"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 60,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.949Z",
                                "updatedAt": "2018-03-26T06:06:57.949Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "SYS_DATA_SIZE",
                                "label": "数据量",
                                "_id": "5ab88e01d98a70566c707ca6"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 150,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.955Z",
                                "updatedAt": "2018-03-26T06:06:57.955Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "date",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_REPORT_DELIVERY_DATE",
                                "label": "报告交付时间(液相)",
                                "_id": "5ab88e01d98a70566c707caf"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 90,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.970Z",
                                "updatedAt": "2018-03-26T06:06:57.970Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                                "SYS_TYPE_LIST": "A:A,B:B,Ca:C-a,Cb:C-b,Cd:C-d,D:D",
                                "SYS_TYPE": "list",
                                "SYS_CODE": "CONF_DNA_EXTRACTION_QC_RESULT",
                                "label": "质检结论",
                                "_id": "5ab88e01d98a70566c707cc8"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 60,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.970Z",
                                "updatedAt": "2018-03-26T06:06:57.970Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "CONF_DNA_EXTRACTION_AMOUNT",
                                "label": "样品总量(ng)",
                                "_id": "5ab88e01d98a70566c707cc7"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 90,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.951Z",
                                "updatedAt": "2018-03-26T06:06:57.951Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_SAMPLE_TYPE",
                                "label": "样品类型",
                                "_id": "5ab88e01d98a70566c707ca9"
                            }
                        ],
                        "__v": 0,
                        "SYS_GENRE_IDENTIFIER": "/PRODUCT_WORKCENTER/",
                        "SYS_CODE": "PROJECT_APPROVE",
                        "id": "5ab88e01d98a70566c707ccf",
                        "SYS_SCHEMA": [
                            {
                                "SYS_LABEL": "Order",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "SYS_ORDER"
                            },
                            {
                                "SYS_LABEL": "工作中心名称",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "label"
                            },
                            {
                                "SYS_LABEL": "Plugin: Panel Indicator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_PANEL_INDICATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Index Indicator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_INDEX_INDICATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Index Validator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Excel Processor",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Auxiliary Attribute Manager",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_ATTRIBUTE_INTRODUCER"
                            }
                        ],
                        "updatedAt": "2018-03-26T06:06:57.975Z",
                        "createdAt": "2018-03-26T06:06:57.975Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label"
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0033",
                        "SYS_TARGET": "5acaf9214421e536ebf5ec05",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0033_1523251489340",
                        "SYS_IDENTIFIER": "/PRODUCT_WORKCENTER/PROJECT_APPROVE/18R0033.20180409132449.2084.1523251489401.3157",
                        "SYS_ENTITY_TYPE": "collection",
                        "CONF_GENERAL_PROJECT_PROJECT_MANAGER": "testpm",
                        "CONF_GENERAL_PROJECT_PROJECT_CODE": "testpmcode",
                        "SYS_GENRE": "5ab88e01d98a70566c707cd0",
                        "SYS_CHECKED": true,
                        "SYS_ORDER": 20,
                        "SYS_SOURCE": "5ab88e01d98a70566c707ccf",
                        "SYS_DURATION": 2,
                        "SYS_FLOOR_ENTITY_TYPE": "class",
                        "SYS_DATE_SCHEDULED": "2018-04-11T05:24:49.360Z"
                    }
                },
                {
                    "workcenter": {
                        "_id": "5ab88e01d98a70566c707cd7",
                        "SYS_IDENTIFIER": "/PRODUCT_WORKCENTER/SHEAR",
                        "SYS_ENTITY_TYPE": "class",
                        "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                        "SYS_ORDER": 30,
                        "label": "打断",
                        "SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR": true,
                        "SYS_AUXILIARY_ATTRIBUTE_LIST": [
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 10,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.945Z",
                                "updatedAt": "2018-03-26T06:06:57.945Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_SERIAL_NUMBER",
                                "label": "序号",
                                "_id": "5ab88e01d98a70566c707ca1"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 20,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.946Z",
                                "updatedAt": "2018-03-26T06:06:57.946Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_PROJECT_MANAGER",
                                "label": "项目负责人",
                                "_id": "5ab88e01d98a70566c707ca2"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 30,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.947Z",
                                "updatedAt": "2018-03-26T06:06:57.947Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_PROJECT_CODE",
                                "label": "项目编号",
                                "_id": "5ab88e01d98a70566c707ca3"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 40,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.947Z",
                                "updatedAt": "2018-03-26T06:06:57.947Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_PANEL_CODE",
                                "label": "Panel名称",
                                "_id": "5ab88e01d98a70566c707ca4"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 50,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.948Z",
                                "updatedAt": "2018-03-26T06:06:57.948Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_DEPTH",
                                "label": "测序深度",
                                "_id": "5ab88e01d98a70566c707ca5"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 60,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.949Z",
                                "updatedAt": "2018-03-26T06:06:57.949Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "SYS_DATA_SIZE",
                                "label": "数据量",
                                "_id": "5ab88e01d98a70566c707ca6"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 70,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.949Z",
                                "updatedAt": "2018-03-26T06:06:57.949Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_SAMPLE_NAME",
                                "label": "样品名称",
                                "_id": "5ab88e01d98a70566c707ca7"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 80,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": true,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.950Z",
                                "updatedAt": "2018-03-26T06:06:57.950Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_SAMPLE_CODE",
                                "label": "样品编号",
                                "_id": "5ab88e01d98a70566c707ca8"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 10,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.966Z",
                                "updatedAt": "2018-03-26T06:06:57.966Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "CONF_DNA_EXTRACTION_NANODROP",
                                "label": "Nanodrop ng/ul",
                                "_id": "5ab88e01d98a70566c707cc2"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 20,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.967Z",
                                "updatedAt": "2018-03-26T06:06:57.967Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "CONF_DNA_EXTRACTION_QUBIT",
                                "label": "Qubit ng/ul",
                                "_id": "5ab88e01d98a70566c707cc3"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 40,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.968Z",
                                "updatedAt": "2018-03-26T06:06:57.968Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "CONF_DNA_EXTRACTION_OD280",
                                "label": "OD 260/280",
                                "_id": "5ab88e01d98a70566c707cc5"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 30,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.968Z",
                                "updatedAt": "2018-03-26T06:06:57.968Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "CONF_DNA_EXTRACTION_OD230",
                                "label": "OD 260/230",
                                "_id": "5ab88e01d98a70566c707cc4"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 50,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.969Z",
                                "updatedAt": "2018-03-26T06:06:57.969Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "CONF_DNA_EXTRACTION_VOLUME",
                                "label": "样品体积(ul)",
                                "_id": "5ab88e01d98a70566c707cc6"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 60,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.970Z",
                                "updatedAt": "2018-03-26T06:06:57.970Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "CONF_DNA_EXTRACTION_AMOUNT",
                                "label": "样品总量(ng)",
                                "_id": "5ab88e01d98a70566c707cc7"
                            }
                        ],
                        "__v": 0,
                        "SYS_GENRE_IDENTIFIER": "/PRODUCT_WORKCENTER/",
                        "SYS_CODE": "SHEAR",
                        "id": "5ab88e01d98a70566c707cd7",
                        "SYS_SCHEMA": [
                            {
                                "SYS_LABEL": "Order",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "SYS_ORDER"
                            },
                            {
                                "SYS_LABEL": "工作中心名称",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "label"
                            },
                            {
                                "SYS_LABEL": "Plugin: Panel Indicator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_PANEL_INDICATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Index Indicator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_INDEX_INDICATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Index Validator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Excel Processor",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Auxiliary Attribute Manager",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_ATTRIBUTE_INTRODUCER"
                            }
                        ],
                        "updatedAt": "2018-03-26T06:06:57.980Z",
                        "createdAt": "2018-03-26T06:06:57.980Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label"
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0033",
                        "SYS_TARGET": "5acaf9214421e536ebf5ec05",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0033_1523251489340",
                        "SYS_IDENTIFIER": "/PRODUCT_WORKCENTER/SHEAR/18R0033.20180409132449.2084.1523251489485.2890",
                        "SYS_ENTITY_TYPE": "collection",
                        "CONF_GENERAL_PROJECT_PROJECT_MANAGER": "testpm",
                        "CONF_GENERAL_PROJECT_PROJECT_CODE": "testpmcode",
                        "SYS_GENRE": "5ab88e01d98a70566c707cd8",
                        "SYS_CHECKED": true,
                        "SYS_ORDER": 30,
                        "SYS_SOURCE": "5ab88e01d98a70566c707cd7",
                        "SYS_DURATION": 2,
                        "SYS_FLOOR_ENTITY_TYPE": "class",
                        "SYS_DATE_SCHEDULED": "2018-04-13T05:24:49.360Z"
                    }
                },
                {
                    "workcenter": {
                        "_id": "5ab88e01d98a70566c707ce1",
                        "SYS_IDENTIFIER": "/PRODUCT_WORKCENTER/LIBRARY_PREPARE",
                        "SYS_ENTITY_TYPE": "class",
                        "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                        "SYS_ORDER": 40,
                        "label": "文库制备",
                        "SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR": true,
                        "SYS_AUXILIARY_ATTRIBUTE_LIST": [
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 20,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.982Z",
                                "updatedAt": "2018-03-26T06:06:57.982Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707cd8",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_SHEAR_CODE",
                                "label": "打断编号",
                                "_id": "5ab88e01d98a70566c707cda"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 40,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.947Z",
                                "updatedAt": "2018-03-26T06:06:57.947Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_PANEL_CODE",
                                "label": "Panel名称",
                                "_id": "5ab88e01d98a70566c707ca4"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 50,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.948Z",
                                "updatedAt": "2018-03-26T06:06:57.948Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_DEPTH",
                                "label": "测序深度",
                                "_id": "5ab88e01d98a70566c707ca5"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 70,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.949Z",
                                "updatedAt": "2018-03-26T06:06:57.949Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_SAMPLE_NAME",
                                "label": "样品名称",
                                "_id": "5ab88e01d98a70566c707ca7"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 80,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": true,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.950Z",
                                "updatedAt": "2018-03-26T06:06:57.950Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_SAMPLE_CODE",
                                "label": "样品编号",
                                "_id": "5ab88e01d98a70566c707ca8"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 90,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.951Z",
                                "updatedAt": "2018-03-26T06:06:57.951Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_SAMPLE_TYPE",
                                "label": "样品类型",
                                "_id": "5ab88e01d98a70566c707ca9"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 30,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.983Z",
                                "updatedAt": "2018-03-26T06:06:57.983Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707cd8",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "CONF_DNA_EXTRACTION_USAGE_AMOUNT",
                                "label": "样品投入量",
                                "_id": "5ab88e01d98a70566c707cdb"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 40,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.984Z",
                                "updatedAt": "2018-03-26T06:06:57.984Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707cd8",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "CONF_DNA_EXTRACTION_REMAIN_AMOUNT",
                                "label": "样品剩余量",
                                "_id": "5ab88e01d98a70566c707cdc"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 10,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.977Z",
                                "updatedAt": "2018-03-26T06:06:57.977Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707cd0",
                                "SYS_TYPE": "date",
                                "SYS_CODE": "CONF_PROJECT_APPROVE_START_DATE",
                                "label": "项目启动时间",
                                "_id": "5ab88e01d98a70566c707cd1"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 20,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.978Z",
                                "updatedAt": "2018-03-26T06:06:57.978Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707cd0",
                                "SYS_TYPE": "date",
                                "SYS_CODE": "CONF_PROJECT_APPROVE_WARN_DATE",
                                "label": "项目预警时间",
                                "_id": "5ab88e01d98a70566c707cd2"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 90,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.970Z",
                                "updatedAt": "2018-03-26T06:06:57.970Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                                "SYS_TYPE_LIST": "A:A,B:B,Ca:C-a,Cb:C-b,Cd:C-d,D:D",
                                "SYS_TYPE": "list",
                                "SYS_CODE": "CONF_DNA_EXTRACTION_QC_RESULT",
                                "label": "质检结论",
                                "_id": "5ab88e01d98a70566c707cc8"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 100,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.972Z",
                                "updatedAt": "2018-03-26T06:06:57.972Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                                "SYS_TYPE_LIST": "1:合格,0:只电泳检测,-1:不合格",
                                "SYS_TYPE": "list",
                                "SYS_CODE": "CONF_DNA_EXTRACTION_QC_REMARK",
                                "label": "质检备注",
                                "_id": "5ab88e01d98a70566c707cc9"
                            }
                        ],
                        "__v": 0,
                        "SYS_GENRE_IDENTIFIER": "/PRODUCT_WORKCENTER/",
                        "SYS_CODE": "LIBRARY_PREPARE",
                        "id": "5ab88e01d98a70566c707ce1",
                        "SYS_SCHEMA": [
                            {
                                "SYS_LABEL": "Order",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "SYS_ORDER"
                            },
                            {
                                "SYS_LABEL": "工作中心名称",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "label"
                            },
                            {
                                "SYS_LABEL": "Plugin: Panel Indicator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_PANEL_INDICATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Index Indicator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_INDEX_INDICATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Index Validator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Excel Processor",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Auxiliary Attribute Manager",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_ATTRIBUTE_INTRODUCER"
                            }
                        ],
                        "updatedAt": "2018-03-26T06:06:57.988Z",
                        "createdAt": "2018-03-26T06:06:57.988Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label"
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0033",
                        "SYS_TARGET": "5acaf9214421e536ebf5ec05",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0033_1523251489340",
                        "SYS_IDENTIFIER": "/PRODUCT_WORKCENTER/LIBRARY_PREPARE/18R0033.20180409132449.2084.1523251489469.0090",
                        "SYS_ENTITY_TYPE": "collection",
                        "CONF_GENERAL_PROJECT_PROJECT_MANAGER": "testpm",
                        "CONF_GENERAL_PROJECT_PROJECT_CODE": "testpmcode",
                        "SYS_GENRE": "5ab88e01d98a70566c707ce2",
                        "SYS_CHECKED": true,
                        "SYS_ORDER": 40,
                        "SYS_SOURCE": "5ab88e01d98a70566c707ce1",
                        "SYS_DURATION": 5,
                        "SYS_FLOOR_ENTITY_TYPE": "class",
                        "SYS_DATE_SCHEDULED": "2018-04-18T05:24:49.360Z"
                    }
                },
                {
                    "workcenter": {
                        "_id": "5ab88e01d98a70566c707cf0",
                        "SYS_IDENTIFIER": "/PRODUCT_WORKCENTER/CAPTURE_PREPARE",
                        "SYS_ENTITY_TYPE": "class",
                        "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                        "SYS_ORDER": 50,
                        "label": "文库捕获",
                        "SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR": true,
                        "SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR": true,
                        "SYS_AUXILIARY_ATTRIBUTE_LIST": [
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 10,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.991Z",
                                "updatedAt": "2018-03-26T06:06:57.991Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ce2",
                                "SYS_TYPE": "date",
                                "SYS_CODE": "CONF_LIBRARY_PREPARE_DATE",
                                "label": "建库日期",
                                "_id": "5ab88e01d98a70566c707ce3"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 20,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.991Z",
                                "updatedAt": "2018-03-26T06:06:57.991Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ce2",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_LIBRARY_CODE",
                                "label": "建库编号",
                                "_id": "5ab88e01d98a70566c707ce4"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 40,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.947Z",
                                "updatedAt": "2018-03-26T06:06:57.947Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_PANEL_CODE",
                                "label": "Panel名称",
                                "_id": "5ab88e01d98a70566c707ca4"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 50,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.948Z",
                                "updatedAt": "2018-03-26T06:06:57.948Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_DEPTH",
                                "label": "测序深度",
                                "_id": "5ab88e01d98a70566c707ca5"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 70,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.949Z",
                                "updatedAt": "2018-03-26T06:06:57.949Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_SAMPLE_NAME",
                                "label": "样品名称",
                                "_id": "5ab88e01d98a70566c707ca7"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 80,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": true,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.950Z",
                                "updatedAt": "2018-03-26T06:06:57.950Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_SAMPLE_CODE",
                                "label": "样品编号",
                                "_id": "5ab88e01d98a70566c707ca8"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 90,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.951Z",
                                "updatedAt": "2018-03-26T06:06:57.951Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_SAMPLE_TYPE",
                                "label": "样品类型",
                                "_id": "5ab88e01d98a70566c707ca9"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 90,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.996Z",
                                "updatedAt": "2018-03-26T06:06:57.996Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ce2",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_S_INDEX_CODE_I7",
                                "label": "Index编号 #1 (I7)",
                                "_id": "5ab88e01d98a70566c707ceb"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 100,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.997Z",
                                "updatedAt": "2018-03-26T06:06:57.997Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ce2",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_S_INDEX_SEQUENCE_I7",
                                "label": "Index序列 #1 (I7)",
                                "_id": "5ab88e01d98a70566c707cec"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 60,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.949Z",
                                "updatedAt": "2018-03-26T06:06:57.949Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "SYS_DATA_SIZE",
                                "label": "数据量",
                                "_id": "5ab88e01d98a70566c707ca6"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 30,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.992Z",
                                "updatedAt": "2018-03-26T06:06:57.992Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ce2",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "CONF_LIBRARY_PREPARE_QUBIT",
                                "label": "Qubit(ng/ul)",
                                "_id": "5ab88e01d98a70566c707ce5"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 40,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.993Z",
                                "updatedAt": "2018-03-26T06:06:57.993Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ce2",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "CONF_LIBRARY_PREPARE_VOLUME",
                                "label": "体积",
                                "_id": "5ab88e01d98a70566c707ce6"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 50,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.994Z",
                                "updatedAt": "2018-03-26T06:06:57.994Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ce2",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "CONF_LIBRARY_PREPARE_AMOUNT",
                                "label": "Total(ng)",
                                "_id": "5ab88e01d98a70566c707ce7"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 70,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.995Z",
                                "updatedAt": "2018-03-26T06:06:57.995Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ce2",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "CONF_LIBRARY_PREPARE_CYCLE",
                                "label": "循环数",
                                "_id": "5ab88e01d98a70566c707ce9"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 80,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.996Z",
                                "updatedAt": "2018-03-26T06:06:57.996Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ce2",
                                "SYS_TYPE_LIST": "1:合格,0:风险,-1:不合格",
                                "SYS_TYPE": "list",
                                "SYS_CODE": "CONF_LIBRARY_PREPARE_RESULT",
                                "label": "建库结论",
                                "_id": "5ab88e01d98a70566c707cea"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 90,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.970Z",
                                "updatedAt": "2018-03-26T06:06:57.970Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707cc0",
                                "SYS_TYPE_LIST": "A:A,B:B,Ca:C-a,Cb:C-b,Cd:C-d,D:D",
                                "SYS_TYPE": "list",
                                "SYS_CODE": "CONF_DNA_EXTRACTION_QC_RESULT",
                                "label": "质检结论",
                                "_id": "5ab88e01d98a70566c707cc8"
                            }
                        ],
                        "__v": 0,
                        "SYS_GENRE_IDENTIFIER": "/PRODUCT_WORKCENTER/",
                        "SYS_CODE": "CAPTURE_PREPARE",
                        "id": "5ab88e01d98a70566c707cf0",
                        "SYS_SCHEMA": [
                            {
                                "SYS_LABEL": "Order",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "SYS_ORDER"
                            },
                            {
                                "SYS_LABEL": "工作中心名称",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "label"
                            },
                            {
                                "SYS_LABEL": "Plugin: Panel Indicator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_PANEL_INDICATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Index Indicator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_INDEX_INDICATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Index Validator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Excel Processor",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Auxiliary Attribute Manager",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_ATTRIBUTE_INTRODUCER"
                            }
                        ],
                        "updatedAt": "2018-03-26T06:06:57.998Z",
                        "createdAt": "2018-03-26T06:06:57.998Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label"
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0033",
                        "SYS_TARGET": "5acaf9214421e536ebf5ec05",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0033_1523251489340",
                        "SYS_IDENTIFIER": "/PRODUCT_WORKCENTER/CAPTURE_PREPARE/18R0033.20180409132449.2084.1523251489428.7971",
                        "SYS_ENTITY_TYPE": "collection",
                        "CONF_GENERAL_PROJECT_PROJECT_MANAGER": "testpm",
                        "CONF_GENERAL_PROJECT_PROJECT_CODE": "testpmcode",
                        "SYS_GENRE": "5ab88e02d98a70566c707cf1",
                        "SYS_CHECKED": true,
                        "SYS_ORDER": 50,
                        "SYS_SOURCE": "5ab88e01d98a70566c707cf0",
                        "SYS_DURATION": 5,
                        "SYS_FLOOR_ENTITY_TYPE": "class",
                        "SYS_DATE_SCHEDULED": "2018-04-23T05:24:49.360Z"
                    }
                },
                {
                    "workcenter": {
                        "_id": "5ab88e02d98a70566c707d0a",
                        "SYS_IDENTIFIER": "/PRODUCT_WORKCENTER/POOLING",
                        "SYS_ENTITY_TYPE": "class",
                        "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                        "SYS_ORDER": 70,
                        "label": "Pooling",
                        "SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR": true,
                        "SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR": true,
                        "SYS_AUXILIARY_ATTRIBUTE_LIST": [
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 70,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.949Z",
                                "updatedAt": "2018-03-26T06:06:57.949Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_SAMPLE_NAME",
                                "label": "样品名称",
                                "_id": "5ab88e01d98a70566c707ca7"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 40,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.947Z",
                                "updatedAt": "2018-03-26T06:06:57.947Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_PANEL_CODE",
                                "label": "Panel名称",
                                "_id": "5ab88e01d98a70566c707ca4"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 60,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.949Z",
                                "updatedAt": "2018-03-26T06:06:57.949Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "SYS_DATA_SIZE",
                                "label": "数据量",
                                "_id": "5ab88e01d98a70566c707ca6"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 100,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.952Z",
                                "updatedAt": "2018-03-26T06:06:57.952Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_SAMPLE_SPECIES",
                                "label": "样品物种",
                                "_id": "5ab88e01d98a70566c707caa"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 90,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.996Z",
                                "updatedAt": "2018-03-26T06:06:57.996Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ce2",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_S_INDEX_CODE_I7",
                                "label": "Index编号 #1 (I7)",
                                "_id": "5ab88e01d98a70566c707ceb"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 100,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.997Z",
                                "updatedAt": "2018-03-26T06:06:57.997Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ce2",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_S_INDEX_SEQUENCE_I7",
                                "label": "Index序列 #1 (I7)",
                                "_id": "5ab88e01d98a70566c707cec"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 80,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:58.008Z",
                                "updatedAt": "2018-03-26T06:06:58.008Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e02d98a70566c707cfb",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_M_INDEX_CODE_I7",
                                "label": "Index编号 #1 (I7)",
                                "_id": "5ab88e02d98a70566c707d03"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 90,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:58.011Z",
                                "updatedAt": "2018-03-26T06:06:58.011Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e02d98a70566c707cfb",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_M_INDEX_SEQUENCE_I7",
                                "label": "Index序列 #1 (I7)",
                                "_id": "5ab88e02d98a70566c707d04"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 100,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:58.011Z",
                                "updatedAt": "2018-03-26T06:06:58.011Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e02d98a70566c707cfb",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_M_INDEX_CODE_I5",
                                "label": "Index编号 #2 (I5)",
                                "_id": "5ab88e02d98a70566c707d05"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 110,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:58.012Z",
                                "updatedAt": "2018-03-26T06:06:58.012Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e02d98a70566c707cfb",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_M_INDEX_SEQUENCE_I5",
                                "label": "Index序列 #2 (I5)",
                                "_id": "5ab88e02d98a70566c707d06"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 60,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.995Z",
                                "updatedAt": "2018-03-26T06:06:57.995Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ce2",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "CONF_LIBRARY_PREPARE_LENGTH",
                                "label": "文库长度",
                                "_id": "5ab88e01d98a70566c707ce8"
                            }
                        ],
                        "__v": 0,
                        "SYS_GENRE_IDENTIFIER": "/PRODUCT_WORKCENTER/",
                        "SYS_CODE": "POOLING",
                        "id": "5ab88e02d98a70566c707d0a",
                        "SYS_SCHEMA": [
                            {
                                "SYS_LABEL": "Order",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "SYS_ORDER"
                            },
                            {
                                "SYS_LABEL": "工作中心名称",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "label"
                            },
                            {
                                "SYS_LABEL": "Plugin: Panel Indicator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_PANEL_INDICATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Index Indicator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_INDEX_INDICATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Index Validator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Excel Processor",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Auxiliary Attribute Manager",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_ATTRIBUTE_INTRODUCER"
                            }
                        ],
                        "updatedAt": "2018-03-26T06:06:58.013Z",
                        "createdAt": "2018-03-26T06:06:58.013Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label"
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0033",
                        "SYS_TARGET": "5acaf9214421e536ebf5ec05",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0033_1523251489340",
                        "SYS_IDENTIFIER": "/PRODUCT_WORKCENTER/POOLING/18R0033.20180409132449.2084.1523251489448.2997",
                        "SYS_ENTITY_TYPE": "collection",
                        "CONF_GENERAL_PROJECT_PROJECT_MANAGER": "testpm",
                        "CONF_GENERAL_PROJECT_PROJECT_CODE": "testpmcode",
                        "SYS_GENRE": "5ab88e02d98a70566c707d0b",
                        "SYS_CHECKED": true,
                        "SYS_ORDER": 70,
                        "SYS_SOURCE": "5ab88e02d98a70566c707d0a",
                        "SYS_DURATION": 5,
                        "SYS_FLOOR_ENTITY_TYPE": "class",
                        "SYS_DATE_SCHEDULED": "2018-04-28T05:24:49.360Z"
                    }
                },
                {
                    "workcenter": {
                        "_id": "5ab88e02d98a70566c707d13",
                        "SYS_IDENTIFIER": "/PRODUCT_WORKCENTER/SEQUENCE_DATA",
                        "SYS_ENTITY_TYPE": "class",
                        "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                        "SYS_ORDER": 80,
                        "label": "数据下机",
                        "SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR": true,
                        "SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR": true,
                        "SYS_AUXILIARY_ATTRIBUTE_LIST": [
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 70,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.949Z",
                                "updatedAt": "2018-03-26T06:06:57.949Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_SAMPLE_NAME",
                                "label": "样品名称",
                                "_id": "5ab88e01d98a70566c707ca7"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 40,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.947Z",
                                "updatedAt": "2018-03-26T06:06:57.947Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "SYS_PANEL_CODE",
                                "label": "Panel名称",
                                "_id": "5ab88e01d98a70566c707ca4"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 60,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.949Z",
                                "updatedAt": "2018-03-26T06:06:57.949Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "SYS_DATA_SIZE",
                                "label": "数据量",
                                "_id": "5ab88e01d98a70566c707ca6"
                            },
                            {
                                "SYS_LABEL": "label",
                                "SYS_ORDER": 100,
                                "SYS_REQUIRED": false,
                                "SYS_IS_ENTITY_LABEL": false,
                                "SYS_TYPE_ENTITY_REF": false,
                                "createdAt": "2018-03-26T06:06:57.952Z",
                                "updatedAt": "2018-03-26T06:06:57.952Z",
                                "__v": 0,
                                "SYS_GENRE": "5ab88e01d98a70566c707ca0",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "CONF_GENERAL_PROJECT_SAMPLE_SPECIES",
                                "label": "样品物种",
                                "_id": "5ab88e01d98a70566c707caa"
                            }
                        ],
                        "__v": 0,
                        "SYS_GENRE_IDENTIFIER": "/PRODUCT_WORKCENTER/",
                        "SYS_CODE": "SEQUENCE_DATA",
                        "id": "5ab88e02d98a70566c707d13",
                        "SYS_SCHEMA": [
                            {
                                "SYS_LABEL": "Order",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "number",
                                "SYS_CODE": "SYS_ORDER"
                            },
                            {
                                "SYS_LABEL": "工作中心名称",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "string",
                                "SYS_CODE": "label"
                            },
                            {
                                "SYS_LABEL": "Plugin: Panel Indicator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_PANEL_INDICATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Index Indicator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_INDEX_INDICATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Index Validator",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Excel Processor",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR"
                            },
                            {
                                "SYS_LABEL": "Plugin: Auxiliary Attribute Manager",
                                "SYS_GENRE": "5ab88e01d98a70566c707cb7",
                                "SYS_TYPE": "boolean",
                                "SYS_CODE": "SYS_WORKCENTER_PLUGIN_ATTRIBUTE_INTRODUCER"
                            }
                        ],
                        "updatedAt": "2018-03-26T06:06:58.016Z",
                        "createdAt": "2018-03-26T06:06:58.016Z",
                        "SYS_PARENT_LIST": [],
                        "SYS_LABEL": "label"
                    },
                    "sample": {
                        "SYS_LABEL": "SYS_SAMPLE_CODE",
                        "SYS_SAMPLE_CODE": "18R0033",
                        "SYS_TARGET": "5acaf9214421e536ebf5ec05",
                        "SYS_AUDIT_DOCSET": "5ab88e01d98a70566c707c64_18R0033_1523251489340",
                        "SYS_IDENTIFIER": "/PRODUCT_WORKCENTER/SEQUENCE_DATA/18R0033.20180409132449.2084.1523251489502.4171",
                        "SYS_ENTITY_TYPE": "collection",
                        "CONF_GENERAL_PROJECT_PROJECT_MANAGER": "testpm",
                        "CONF_GENERAL_PROJECT_PROJECT_CODE": "testpmcode",
                        "SYS_GENRE": "5ab88e02d98a70566c707d14",
                        "SYS_CHECKED": true,
                        "SYS_ORDER": 80,
                        "SYS_SOURCE": "5ab88e02d98a70566c707d13",
                        "SYS_DURATION": 7,
                        "SYS_FLOOR_ENTITY_TYPE": "class",
                        "SYS_DATE_SCHEDULED": "2018-05-05T05:24:49.360Z"
                    }
                }
            ]
        ]
        let output = 
            `
        # **18R0020**

        testpcode | testpm

        issued as:

        >- 项目负责人: testpm

        >- 项目编号: testpcode

        >- 样品编号: 18R0020

        >- 操作人: 5ab88e01d98a70566c707c64

        >- 操作日期: Mon Apr 09 2018 13:19:53 GMT+0800 (CST)

        workcenters:

        >- 04月09日: 样品提取

        >- 04月11日: 项目审核

        >- 04月13日: 打断

        >- 04月18日: 文库制备

        >- 04月23日: 文库捕获

        >- 04月28日: Pooling

        >- 05月05日: 数据下机

        > 

        吴洋

        2018-4-9 13:19
        `
    })// }}}

    // sendMessageDingtalk with 5 samples{{{
    it('TEST: sendMessageDingtalk with issued 5 samples', done => {
        //let selectedSampleList = [
        //{
        //}
        //]
        //let submittedSampleList = [
        //let attributeList = [
        //let targetOutputList = [
        //let output = 
    })// }}}

    // sendMessageDingtalk with excel {{{
    it('TEST: sendMessageDingtalk with submitted 5 samples', done => {
        //let selectedSampleList = [
        //{
        //}
        //]
        //let submittedSampleList = [
        //let attributeList = [
        //let targetOutputList = [
        //let output = 
    })// }}}
})
