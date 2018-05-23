import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {MatDialog, MatDialogRef} from '@angular/material'
import {MatSnackBar} from '@angular/material'
import {Router, ActivatedRoute} from '@angular/router'

@Component({
    selector: 'sample-overview',
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
    templateUrl: './overview.component.html',
})
export class SampleOverviewComponent {

    sampleCode: string
    sampleProjectManagementList: any[] = []
    sampleProductWorkcenterList: any[] = []
    sampleMaterialList: any[] = []
    skipMap: any = {
        "workcenter": 0,
        "material": 0,
    }
    sampleProductWorkcenterShown: any[] = []
    sampleMaterialShown: any[] = []

    queryCode: string = ''
    queryValue: string = ''
    showPanel: any = {}

    constructor(
        public dialog: MatDialog,
        private entityService: EntityService,
        private snackBar: MatSnackBar,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        this.sampleCode = this.route.snapshot.params['sample_code']
    }

    ngOnInit() {
        this.entityService.retrieveBy({
            "SYS_SAMPLE_CODE": this.sampleCode
        })
            .subscribe(data => {
                data
                    .sort((a, b) => {
                        if (a.updatedAt < b.updatedAt) {
                            return 1
                        } else {
                            return -1
                        }
                    })
                    .forEach(sample => {
                        if (sample.SYS_IDENTIFIER.startsWith("/PROJECT_MANAGEMENT/GENERAL_PROJECT/")) {
                            this.sampleProjectManagementList.push(sample)
                        }
                        if (sample.SYS_IDENTIFIER.startsWith("/PRODUCT_WORKCENTER/")) {
                            this.entityService.retrieveById(sample.SYS_SOURCE)
                                .subscribe(data => {
                                    sample['TMP_SOURCE'] = data[data['SYS_LABEL']]
                                    this.sampleProductWorkcenterList.push(sample)
                                })
                        }
                        if (sample.SYS_IDENTIFIER.startsWith("/MATERIAL/")) {
                            this.entityService.retrieveById(sample.SYS_SOURCE)
                                .subscribe(data => {
                                    sample['TMP_SOURCE'] = data[data['SYS_LABEL']]
                                    this.sampleMaterialList.push(sample)
                                    console.log("M", sample)
                                })
                        }
                    })
                this.updateResultList("workcenter")
                this.updateResultList("material")
            })
    }

    nextPage(section: string) {
        this.skipMap[section] += 10
        this.updateResultList(section)
    }

    prevPage(section: string) {
        this.skipMap[section] -= 10
        if (this.skipMap[section] <= 0) {
            this.skipMap[section] = 0
        }
    }

    updateResultList(section: string) {
        switch (section) {
            case "workcenter":
                this.sampleProductWorkcenterShown = this.sampleProductWorkcenterList.slice[this.skipMap[section], this.skipMap[section] + 10]
                break
            case "material":
                this.sampleMaterialShown = this.sampleMaterialList.slice[this.skipMap[section], this.skipMap[section] + 10]
                break
        }
    }

    clearQuery() {
        this.queryCode = ''
        this.queryValue = ''
    }

    showMessage(msg: string) {
        this.snackBar.open(msg, 'OK', {duration: 3000});
    }

    openPanel(sampleSection: string) {
        Object.keys(this.showPanel).forEach(key => {
            if (key == sampleSection) {
                this.showPanel[key] = true
            } else {
                this.showPanel[key] = false
            }
        })
    }

    closePanel(lotId: string) {
        this.showPanel[lotId] = false
    }

    isExpanded(lotId: string) {
        return this.showPanel[lotId]
    }

    showMaterialDetail(sourceId: string) {
        this.entityService.retrieveById(sourceId)
            .subscribe(data => {
            })
    }
}
