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
    @Input() material: any
    @Input() workcenter: any
    @Output() materialChange = new EventEmitter<any>()
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
        if (this.workcenter['SYS_IDENTIFIER'] == '/PROJECT_MANAGEMENT/GENERAL_PROJECT') {
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

    filterMaterials$(materialLabel: string) {
        return this.materialList$.map(res => {
            return res.filter(material => {
                return material[material['SYS_LABEL']].toLowerCase().indexOf(materialLabel.toLowerCase()) >= 0
            })
        })
    }

    onMaterialClick(material: any) {
        this.materialChange.emit(material)
        this.materialCtrl.setValue('')
    }

}
