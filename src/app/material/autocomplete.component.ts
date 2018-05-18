import {Component, Input, Output, EventEmitter} from '@angular/core'
import {FormControl} from '@angular/forms'
import {Observable} from 'rxjs/Observable'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/startWith'
import 'rxjs/add/operator/switchMap'
import {EntityService} from '../entity/service'

@Component({
    selector: 'material-autocomplete',
    templateUrl: './autocomplete.component.html',
})
export class MaterialAutocompleteComponent {
    @Input() filter: any
    @Input() refEntityListSubject: any
    @Input() workcenter: any
    @Output() refEntityListSubjectChange = new EventEmitter<any>()
    placeholder: string = ''
    baseIdentifier: string = ''
    materialCtrl: FormControl = new FormControl()
    materialList$: Observable<any[]>
    filteredMaterialList$: Observable<any[]>

    constructor(
        public entityService: EntityService
    ) {
    }

    ngOnInit() {
        if (this.isProjectWorkcenter()) {
            this.baseIdentifier = '/PRODUCT_WORKCENTER'
            this.placeholder = 'more workcenters...'
        } else {
            this.baseIdentifier = '/MATERIAL'
            this.placeholder = 'more materials...'
        }

        this.materialList$ = this.entityService.retrieveByIdentifierAndCategory(
            this.baseIdentifier,
            'class',
        )
        this.filteredMaterialList$ = this.materialCtrl.valueChanges
            .startWith('')
            .debounceTime(200)
            .distinctUntilChanged()
            .switchMap(value => {
                return this.filterMaterials$(value || '')
            })

    }

    isProjectWorkcenter() {
        return this.workcenter['SYS_IDENTIFIER'] == '/PROJECT_MANAGEMENT/GENERAL_PROJECT'
    }

    filterMaterials$(materialLabel: string) {
        return this.materialList$.map(res => {
            if (materialLabel) {
                return res.filter(material => {
                    return material[material['SYS_LABEL']].toLowerCase().indexOf(materialLabel.toLowerCase()) >= 0
                })
            } else {
                return res
            }
        })
    }

    onMaterialClick(material: any) {
        let fakeRefEntity = {
            'id': 'fake_' + Date.now(),
            'SYS_CHECKED': true,
            'SYS_IDENTIFIER': this.baseIdentifier + '/',
            'SYS_SOURCE': material.id,
        }

        if (this.isProjectWorkcenter()) {
            fakeRefEntity['SYS_DURATION'] = 1
            fakeRefEntity['SYS_ORDER'] = 1000
        } else {
            fakeRefEntity['SYS_QUANTITY'] = 0
            fakeRefEntity['SYS_REMARK'] = '手动增加'
        }
        this.refEntityListSubject.next([...this.refEntityListSubject.getValue(), fakeRefEntity])
        this.refEntityListSubjectChange.emit(this.refEntityListSubject)
        this.materialCtrl.setValue('')
    }

}
