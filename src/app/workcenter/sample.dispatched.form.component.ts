import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {GenreService} from '../genre/service'

@Component({
    selector: 'form-sample-dispatched',
    templateUrl: './sample.dispatched.form.component.html',
})

export class SampleDispatchedFormComponent {
    @Input() workcenter
    genreList: any[] = []
    attributeList: any[] = []
    parentMap: any = {}
    object: any = {}

    constructor(
        public entityService: EntityService,
        public genreService: GenreService,
    ) {}

    ngOnInit() {
        this.getGenreList()
    }

    getGenreList() {
        this.entityService.retrieveGenre(this.workcenter.id)
            .subscribe(genreList => {
                this.genreList = genreList
                if (genreList.length > 0) {
                    this.getAttributeListByGenreId(genreList[0].id)
                }
            })
    }

    getAttributeListByGenreId(genreId: string) {
        this.genreService.retrieveAttribute(genreId)
            .subscribe(attributeList => {
                this.attributeList = attributeList
                    .sort((a, b) => {
                        if (a.SYS_ORDER > b.SYS_ORDER) {
                            return 1
                        } else {
                            return -1
                        }
                    })
                this.attributeList.map(attribute => {
                    switch (attribute.SYS_TYPE) {
                        case "entity":
                            if (!attribute.SYS_TYPE_ENTITY_REF) {
                                this.parentMap[attribute.SYS_CODE] = {}
                            }
                            break
                    }
                })
            })
    }
}
