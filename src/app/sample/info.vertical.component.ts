import {Component, Input} from '@angular/core'
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
    @Input() sample
    @Input() commonGenreIdentifier
    commonGenreId: string
    attributeListMap: any = {}
    uniqueGenreMap: any = {}

    commonAttributeList: any[] = []

    constructor(
        public genreService: GenreService,
    ) {}

    ngOnInit() {
        this.getCommonAttributeList$()
            .subscribe(data => {
                this.commonAttributeList = data
            })
    }

    getCommonAttributeList$() {
        return this.genreService.retrieveBy({
            'SYS_IDENTIFIER': this.commonGenreIdentifier,
        })
            .mergeMap(genreList => {
                let genre = genreList[0]
                this.commonGenreId = genre.id
                return this.genreService.retrieveAttribute(genre.id)
            })
    }

    getUniqueGenreBySample$(sample: any) {
        if (!this.uniqueGenreMap[sample['SYS_GENRE']]) {
            this.uniqueGenreMap[sample['SYS_GENRE']] = this.genreService.retrieveBy({
                '_id': sample['SYS_GENRE']
            })
                .map(data => {
                    let genre = data[0]
                    if (genre['SYS_IDENTIFIER'] == this.commonGenreIdentifier) {
                        return {}
                    } else {
                        return data[0]
                    }
                })
        }
        return this.uniqueGenreMap[sample['SYS_GENRE']]
    }

    getUniqueAttributeListBySample$(sample: any) {
        if (!this.attributeListMap[sample.id]) {
            if (sample['SYS_GENRE'] == this.commonGenreId) {
                this.attributeListMap[sample.id] = Observable.of([])
            } else {
                this.attributeListMap[sample.id] = Observable.of(sample['SYS_SCHEMA'])
            }
        }
        return this.attributeListMap[sample.id]
    }

}
