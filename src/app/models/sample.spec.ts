import {
    TestBed,
    inject,
} from '@angular/core/testing'
import {
    MockBackend,
} from '@angular/http/testing'
import {
    HttpModule,
    BaseRequestOptions,
    ResponseOptions,
} from '@angular/http'
import {Router} from '@angular/router'
import {Observable} from 'rxjs/Rx'
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
            MatSnackBar,
            GenreService,
            UtilService,
            Router,
            EntityService,
        ],
        (
            http: CustomHttpService,
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
            service = new SampleService(
                snackbar,
                //genreService,
                newGenreService,
                utilService,
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

})
