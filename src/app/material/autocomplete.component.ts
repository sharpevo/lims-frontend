import {Component, Input, Output, EventEmitter} from '@angular/core'
import {FormControl} from '@angular/forms'
import {Observable} from 'rxjs/Observable'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/startWith'
import {EntityService} from '../entity/service'

@Component({
    selector: 'material-autocomplete',
    templateUrl: './autocomplete.component.html',
})
export class MaterialAutocompleteComponent {
    @Input() filter: any
    @Input() material: any
    @Output() materialChange = new EventEmitter<any>()
    materialList: any[] = []

    materialCtrl: FormControl = new FormControl()
    filteredMaterials: Observable<any[]>

    constructor(
        public entityService: EntityService
    ) {
    }

    ngOnInit() {
        this.getMaterialList$()
            .subscribe(materialList => {
                console.log("ML", materialList)
                this.materialList = materialList
                this.filteredMaterials = this.materialCtrl.valueChanges
                    .startWith('')
                    .map(material => material ? this.filterMaterials(material) : this.materialList.slice())
            })

    }
    getMaterialList$() {
        return this.entityService.retrieveByIdentifierAndCategory(
            '/MATERIAL',
            'class',
        )
    }

    filterMaterials(title: string) {
        return this.materialList.filter(material => {
            return material[material['SYS_LABEL']].toLowerCase().indexOf(title.toLowerCase()) > 0
        })
    }

    onMaterialClick(material: any) {
        console.log("click")
        this.materialChange.emit(material)
        this.materialCtrl.setValue('')
    }

}
