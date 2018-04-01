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
import {CustomHttpService} from '../util/custom.http.service'// }}}

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
        ) => {
            let mockEntityService = new MockEntityService(http)
            let mockUserInfoService = new MockUserInfoService()
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

})
