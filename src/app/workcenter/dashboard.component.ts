import {Component, ViewChild} from '@angular/core'
import {ActivatedRoute, Router} from '@angular/router'
import {MatDialog, MatDialogRef} from '@angular/material'
import {EntityService} from '../entity/service'
import {SampleFormDialog} from './form.dialog.component'
import {UserInfoService} from '../util/user.info.service'

//import {Observable} from 'rxjs/Observable'
import { Observable } from 'rxjs/Rx'
import {MatSnackBar} from '@angular/material'

@Component({
    selector: 'workcenter-dashboard',
    templateUrl: './dashboard.component.html',
    styles:[`
        .disabled-panel{
        opacity: 0.3;
        pointer-events: none;
        }
        .mat-select{
        margin-top:-9px;
        }
        `],
})
export class WorkcenterDashboardComponent{
    sub: any = {}
    selectedOption: string
    objectId: string = ''
    workcenter: any = {}
    workcenterId: string = ''
    checkedEntityList: any[] = []
    checkedDispatchedEntityList: any[] = []
    operatorList: any[] = []
    operator: string = ''
    operatorCode: string = 'SYS_WORKCENTER_OPERATOR'
    @ViewChild('dispatchedComponent') dispatchedComponent
    @ViewChild('activatedComponent') activatedComponent
    @ViewChild('completedComponent') completedComponent
    showPanel: any = {
        'scheduled': false,
        'activated': false,
        'dispatched': false,
        'completed': false,
        'terminated': false,
    }

    sampleList: any[] = []

    // set the default tabs in order to remove animations manually
    selectedIndex: number = 1

    constructor(
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private router: Router,
        private entityService: EntityService,
        private userInfoService: UserInfoService,
        private snackBar: MatSnackBar,
    ){
        this.objectId = this.route.snapshot.params['id']
    }

    ngOnInit(){
        this.sub = this.route.params.subscribe(params => {
            this.workcenterId = params['id']
            this.getWorkcenter()
            this.getOperatorList()
            this.getSampleList()
        })
    }

    getSampleList(){
        this.entityService.retrieveEntity(this.workcenterId, 'collection')
        .subscribe(data => {
            this.sampleList = data
        })
    }

    getWorkcenter(){
        this.entityService.retrieveById(this.workcenterId)
        .subscribe(data => {
            this.workcenter = data
            let roleName = "lims-workcenter-" + data['SYS_CODE'].toLowerCase()
            if (!this.userInfoService.hasRole(roleName)){
                //this.userInfoService.permFail()
            }

        })
    }

    getOperatorList(){
        this.entityService.retrieveByIdentifierAndCategory(
            '/HUMAN_RESOURCE/IGENETECH',
            'collection')
            .subscribe(data => {
                this.operatorList = data
            })
    }

    dispatch(){
        let retrieveObs = []
        let updateObs = []
        if (!this.operator) {
            return
        }

        this.sampleList.forEach(previousSample => {
            if (previousSample['TMP_CHECKED']){
                //retrieveObs.push(this.entityService.retrieveById(previousSample['TMP_NEXT_SAMPLE_ID']))
                retrieveObs.push(this.entityService.retrieveById(previousSample.id))
            }
        })

        Observable
        .forkJoin(retrieveObs)
        .subscribe(data => {
            data.forEach(d => {
                d[this.operatorCode] = this.operator
                updateObs.push(this.entityService.update(d))
            })

            Observable
            .forkJoin(updateObs)
            .subscribe(data => {
                // Update child component after updating sample list
                // it works better than asynchronous func like getSampleList()
                // same as undispatch()
                this.entityService.retrieveEntity(this.workcenterId, 'collection')
                .subscribe(data => {
                    this.sampleList = data
                    this.activatedComponent.getSampleList()
                })
            })
        })

    }

    undispatch(){
        let retrieveObs = []
        let updateObs = []

        this.sampleList.forEach(previousSample => {
            if (previousSample['TMP_CHECKED']){
                //retrieveObs.push(this.entityService.retrieveById(previousSample['TMP_NEXT_SAMPLE_ID']))
                retrieveObs.push(this.entityService.retrieveById(previousSample.id))
            }
        })

        Observable
        .forkJoin(retrieveObs)
        .subscribe(data => {
            data.forEach(d => {
                d[this.operatorCode] = ""
                updateObs.push(this.entityService.update(d))
            })

            Observable
            .forkJoin(updateObs)
            .subscribe(data => {
                this.entityService.retrieveEntity(this.workcenterId, 'collection')
                .subscribe(data => {
                    this.sampleList = data
                    this.dispatchedComponent.getSampleList()
                    this.activatedComponent.getSampleList()
                })
            })
        })
    }

    selectAllSamples(){
        this.sampleList.forEach(sample => {
            if (!sample['SYS_DATE_TERMINATED']){
                sample.TMP_CHECKED = !sample.TMP_CHECKED
            }
        })
    }

    openNewEntityDialog(entity: any) {
        let dialogRef = this.dialog.open(SampleFormDialog, {height: '850px', width: '600px'});
        dialogRef.componentInstance.config.entity = entity
        dialogRef.componentInstance.config.sampleList = this.sampleList.filter(sample => sample['TMP_CHECKED'])
        dialogRef.afterClosed().subscribe(result => {
            this.router.navigate(['/redirect' + this.router.url])
        });
    }

    editSample(){
        this.showMessage("planning...")
    }
    terminateSample(){
        this.showMessage("planning...")
    }
    showMessage(msg: string) {
        this.snackBar.open(msg, 'OK', {duration: 3000});
    }

    openPanel(panel: string){
        Object.keys(this.showPanel).forEach(key => {
            if (key == panel){
                this.showPanel[key] = true
            } else {
                this.showPanel[key] = false
            }
        })
        console.log(this.showPanel)
    }
    closePanel(panel: string){
        this.showPanel[panel] = false
    }
    isExpanded(panel: string){
        return this.showPanel[panel]
    }
}
