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
    })

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
    )

    it('TEST: submitSubEntity', done => {

        // mock data{{{
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
        )// }}}

        // test issue sample
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

        // test submit sample
        service.submitSubEntity(
            subEntity,
            targetEntity,
            targetEntityInput,
        ).subscribe(workcenterAndSample => {
            let sample = workcenterAndSample['sample']
            expect(sample.SYS_GENRE).toEqual(targetEntity['SYS_GENRE'])
            done()
        })

    })

})
