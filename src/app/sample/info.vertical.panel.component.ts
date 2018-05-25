import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {Observable} from 'rxjs/Observable'

@Component({
    selector: 'sample-info-vertical-panel',
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
    templateUrl: './info.vertical.panel.component.html',
})
export class SampleInfoVerticalPanelComponent {
    @Input() sampleCode
    @Input() sampleId
    projectSampleList$: Observable<any[]>
    generalProjectGenreIdentifier = '/PROJECT_MANAGEMENT/GENERAL_PROJECT/'

    constructor(
        public entityService: EntityService,
    ) {}

    ngOnInit() {
        this.projectSampleList$ = this.getProjectSampleList$()
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
                            .startsWith(this.generalProjectGenreIdentifier)
                    })
            })
    }
}
