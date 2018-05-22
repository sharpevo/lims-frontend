import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {GenreService} from '../genre/service'
import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/empty'

const GENERAL_PROJECT_GENRE_IDENTIFIER = '/PROJECT_MANAGEMENT/GENERAL_PROJECT/'

@Component({
    selector: 'sample-info-vertical',
    styles: [`
    .disabled-panel{
    opacity: 0.3;
    pointer-events: none;
    }
    .mat-select{
    margin-top:-9px;
    }
    `
    ],
    templateUrl: './info.vertical.component.html',
})
export class SampleInfoVerticalComponent {
    @Input() sampleCode
    @Input() sampleId
    commonGenreId: string
    commonAttributeList$: Observable<any[]>
    projectSampleList$: Observable<any[]>
    attributeListMap: any = {}

    commonAttributeList: any[] = []
    uniqueAttributeList: any[] = []
    uniqueGenre: any = {}
    sample: any

    constructor(
        public entityService: EntityService,
        public genreService: GenreService,
    ) {}

    ngOnInit() {
        this.projectSampleList$ = this.getProjectSampleList$()
        this.getCommonAttributeList$()
            .subscribe(data => {
                this.commonAttributeList = data
            })
    }

    getSampleList$() {
        if (this.sampleCode) {
            return this.entityService.retrieveBy({
                "SYS_SAMPLE_CODE": this.sampleCode
            })
        } else if (this.sampleId) {
            return this.entityService.retrieveBy({
                "_id": this.sampleId
            })
        } else {
            return Observable.of({})
        }
    }

    getProjectSampleList$() {
        return this.getSampleList$()
            .map(data => {
                return data
                    .sort((a, b) => {
                        if (a.updatedAt < b.updatedAt) {
                            return 1
                        } else {
                            return -1
                        }
                    })
                    .filter(item => {
                        return item['SYS_IDENTIFIER']
                            .startsWith(GENERAL_PROJECT_GENRE_IDENTIFIER)
                    })
            })
    }

    getCommonAttributeList$() {
        return this.genreService.retrieveBy({
            'SYS_IDENTIFIER': GENERAL_PROJECT_GENRE_IDENTIFIER,
        })
            .mergeMap(genreList => {
                let genre = genreList[0]
                this.commonGenreId = genre.id
                return this.genreService.retrieveAttribute(genre.id)
            })
    }

    getUniqueAttributeListBySample$(sample: any) {
        if (!this.attributeListMap[sample.id]) {
            if (sample['SYS_GENRE']['id'] == this.commonGenreId) {
                this.attributeListMap[sample.id] = Observable.of([])
            } else {
                this.attributeListMap[sample.id] = Observable.of(sample['SYS_SCHEMA'])
            }
        }
        return this.attributeListMap[sample.id]
    }

}
