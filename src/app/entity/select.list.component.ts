import {Component, Input, Output, EventEmitter} from '@angular/core'
import {EntityService} from './service'
import {UserInfoService} from '../util/user.info.service'
import {Subscription} from 'rxjs/Subscription'

@Component({
    selector: 'entity-select-list',
    templateUrl: './select.list.component.html',
})

export class EntitySelectListComponent {
    @Input('object') object // object to generate the form
    @Input('attribute') attribute // used in the template for ngModel
    @Input('ceilingEntityId') entityId
    @Input('optionLevel') optionLevel
    @Input() materialObject
    @Output() materialObjectChange = new EventEmitter<any>()
    entityList: any[] = []
    placeholder: string = ""
    floorEntityType: string = ""

    userInfo: any

    constructor(
        private entityService: EntityService,
        private userInfoService: UserInfoService,
    ) {}

    ngOnInit() {
        if (!this.object) {
            this.object = {}
        }

        this.getEntityPlaceholder()
        this.floorEntityType = this.optionLevel
        this.getEntityList()

        this.userInfo = this.userInfoService.getUserInfo()
        if (this.attribute.SYS_CODE == "SYS_WORKCENTER_OPERATOR") {
            this.object[this.attribute.SYS_CODE] = this.userInfo.limsid
        }
    }

    getEntityList() {
        //console.log('>>floor:', this.floorEntityType)
        //console.log('>>attribute:', this.attribute)
        this.entityService.retrieveEntity(this.entityId, this.floorEntityType)
            .subscribe(data => {
                this.entityList = data
                //console.log(data)
            })
    }

    getEntityPlaceholder() {
        this.entityService.retrieveById(this.entityId)
            .subscribe(data => {
                this.placeholder = data[data['SYS_LABEL']]
                this.materialObjectChange.emit(data)
            })
    }
}
