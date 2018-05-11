import {Component, Input} from '@angular/core'
import {DatePipe} from '@angular/common'
import {MatSnackBar} from '@angular/material'

import {AttributeService} from '../attribute/service'
import {GenreService} from '../genre/service'
import {EntityService} from './service'

@Component({
    selector: 'entity-form-inline',
    templateUrl: './form.inline.component.html',
})
export class EntityFormInlineComponent {
    @Input('entity') entity
    @Input('object') objectMap
    @Input('optionLevel') optionLevel
    object: any = {}
    attributeList: any[] = []
    materialObject: any = {}
    constructor(
        private entityService: EntityService) {}

    ngOnInit() {
        if (!this.objectMap[this.entity.id]) {
            this.objectMap[this.entity.id] = {}
        }
        this.object = this.objectMap[this.entity.id]
        this.getAttributeList()
    }

    getAttributeList() {
        if (this.entity['SYS_IDENTIFIER'].startsWith('/MATERIAL/')) {
            this.attributeList = [
                {
                    'SYS_ORDER': 10,
                    'SYS_CODE': 'SYS_CHECKED',
                    'SYS_TYPE': 'boolean',
                    'SYS_LABEL': 'label',
                    'label': '',
                },
                {
                    'SYS_ORDER': 20,
                    'SYS_CODE': 'SYS_SOURCE',
                    'SYS_TYPE': 'entity',
                    'SYS_LABEL': 'label',
                    'label': 'Material',
                    'SYS_TYPE_ENTITY_REF': true,
                    'SYS_FLOOR_ENTITY_TYPE': 'collection',
                },
                {
                    'SYS_ORDER': 30,
                    'SYS_CODE': 'SYS_QUANTITY',
                    'SYS_TYPE': 'number',
                    'SYS_LABEL': 'label',
                    'label': 'Quantity',
                },
                {
                    'SYS_ORDER': 40,
                    'SYS_CODE': 'SYS_REMARK',
                    'SYS_TYPE': 'string',
                    'SYS_LABEL': 'label',
                    'label': 'Remark',
                },
            ]
            this.attributeList.forEach(attribute => {
                this.object[attribute.SYS_CODE] = this.entity[attribute.SYS_CODE]
            })
            this.object["SYS_FLOOR_ENTITY_TYPE"] = this.optionLevel
        } else {
            this.entityService.retrieveAttribute(this.entity.id)
                .subscribe(data => {
                    console.log("form", data)
                    data.forEach(attribute => {
                        this.object[attribute.SYS_CODE] = this.entity[attribute.SYS_CODE]
                    })
                    this.object["SYS_FLOOR_ENTITY_TYPE"] = this.optionLevel
                    this.attributeList = data
                })
        }
    }

}
