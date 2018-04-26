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
    showPanel: any = {
        'form': false,
    }

    constructor(
        public entityService: EntityService,
        public genreService: GenreService,
    ) {}

    ngOnInit() {
        this.object[this.parentMapKey] = {}
        this.genreList = []
        this.getGenreList()
    }

    initComponent() {
        this.object[this.parentMapKey] = {}
        this.attributeList = []
        if (this.genreList.length > 0) {
            this.getAttributeListByGenreId(this.genreList[0].id)
        }

    }

    getGenreList() {
        this.entityService.retrieveGenre(this.workcenter.id)
            .subscribe(genreList => {
                this.genreList = genreList
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

    openPanel(panel: string) {
        this.showPanel[panel] = true
        this.initComponent()
    }
    closePanel(panel: string) {
        this.showPanel[panel] = false
    }
    isExpandedPanel(panel: string) {
        return this.showPanel[panel]
    }
}
