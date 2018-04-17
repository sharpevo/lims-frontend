import {
    TestBed,
    inject,
} from '@angular/core/testing'
import {
    MockBackend,
} from '@angular/http/testing'

import {ExcelService} from './excel.service'
import {EntityService} from '../entity/service'
import {GenreService} from '../genre/service'
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
                UserInfoService,
                LogService,
                LogPublisherService,
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
        ], (
            httpService: CustomHttpService,
            entityService: EntityService,
            genreService: GenreService) => {
                service = new ExcelService(entityService, genreService)
            }))

    it("should return genre by id", done => {
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

    it("should return attributeList of the first genre in the list", done => {
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

    it("should return parentMap", done => {
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

})
