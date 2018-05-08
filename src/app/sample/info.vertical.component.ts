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
    commonAttributeList: any[] = []
    uniqueAttributeList: any[] = []
    uniqueGenre: any = {}
    sample: any

    constructor(
        public entityService: EntityService,
        public genreService: GenreService,
    ) {}

    ngOnInit() {
        this.getAttributeList()
    }

    getAttributeList() {
        this.entityService.retrieveBy({
            "SYS_SAMPLE_CODE": this.sampleCode
        })
            .subscribe(data => {
                this.sample = data
                    .sort((a, b) => {
                        if (a.updatedAt < b.updatedAt) {
                            return 1
                        } else {
                            return -1
                        }
                    })
                    .find(item => {
                        return item['SYS_IDENTIFIER']
                            .startsWith(GENERAL_PROJECT_GENRE_IDENTIFIER)
                    })

                this.uniqueAttributeList = this.sample['SYS_SCHEMA']

                this.getUniqueGenre$().subscribe(genre => {
                    this.uniqueGenre = genre
                    if (this.uniqueGenre['SYS_IDENTIFIER'] == GENERAL_PROJECT_GENRE_IDENTIFIER) {
                        this.commonAttributeList = []

                    } else {
                        this.getCommonAttribute$()
                            .subscribe(attributeList => {
                                this.commonAttributeList = attributeList
                            })

                    }
                })

            })
    }

    getUniqueGenre$(): Observable<any> {
        return this.genreService.retrieveBy({'_id': this.sample['SYS_GENRE']})
            .map(genreList => genreList[0])
    }

    getCommonAttribute$(): Observable<any[]> {
        return this.genreService.retrieveBy({
            'SYS_IDENTIFIER': GENERAL_PROJECT_GENRE_IDENTIFIER,
        })
            .mergeMap(genreList => {
                let genre = genreList[0]
                if (genre.id == this.sample['SYS_GENRE']) {
                    return Observable.of([])
                } else {
                    return this.genreService.retrieveAttribute(genre.id)
                }
            })
    }
}
