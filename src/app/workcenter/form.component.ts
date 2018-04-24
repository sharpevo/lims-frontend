import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {GenreService} from '../genre/service'

@Component({
    selector: 'workcenter-form',
    templateUrl: './form.component.html',
})

export class WorkcenterFormComponent {
    @Input() workcenter
    @Input() object
    genreList: any[] = []
    attributeList: any[] = []
    parentMapKey: string = "TMP_PARENT_MAP"

    constructor(
        public entityService: EntityService,
        public genreService: GenreService,
    ) {}

    ngOnInit() {
        this.object[this.parentMapKey] = {}
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
        this.attributeList = []
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
                                this.object[this.parentMapKey][attribute.SYS_CODE] = {}
                            }
                            break
                    }
                })
            })
    }

    onSelectedTabChange(event) {
        this.getAttributeListByGenreId(this.genreList[event.index].id)
    }
}
