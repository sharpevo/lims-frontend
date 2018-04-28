import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {GenreService} from '../genre/service'
import {DatePipe} from '@angular/common'

@Component({
    selector: 'workcenter-form',
    templateUrl: './form.component.html',
    styles: [`
        /deep/.mat-tab-label, /deep/.mat-tab-label-active{
        min-width: 0!important;
        padding: 5px!important;
        margin: 5px!important;
        }
    `]
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
    commonGenre: any = {}
    commonAttributeList: any[] = []

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
                this.genreList = genreList.sort((a, b) => {
                    return a.SYS_ORDER > b.SYS_ORDER
                }).filter(genre => {
                    if (genre['SYS_IDENTIFIER'] == this.workcenter['SYS_IDENTIFIER'] + '/') {
                        this.commonGenre = genre
                        this.genreService.retrieveAttribute(genre.id)
                            .subscribe(attributeList => {
                                this.commonAttributeList = attributeList
                                    .filter(attribute => {
                                        if (attribute['SYS_CODE'] == 'SYS_DATE_COMPLETED') {
                                            this.object[attribute['SYS_CODE']] = new DatePipe('en-US').transform(new Date(), 'yyyy-MM-dd')
                                        }
                                        return attribute['SYS_IS_ON_BOARD']
                                    })
                            })
                    }
                    return genre.visible
                })
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
