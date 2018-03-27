import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {MatDialog, MatDialogRef} from '@angular/material'
import {SampleFormDialog} from './form.dialog.component'
import {MatSnackBar} from '@angular/material'
import {EditPMSampleDialog} from './project.management.edit.dialog'
import {SuspendSampleDialog} from './project.management.suspend.dialog'
import {SampleService} from '../models/sample'

@Component({
    selector: 'project-management',
    styles: [`
        .disabled-panel{
        opacity: 0.3;
        pointer-events: none;
        }
        .mat-select{
        margin-top:-9px;
        }
        .suspend-panel{
        background: rgba(255,215,64,0.3);
        }
        `
    ],
    templateUrl: './project.management.component.html',
})
export class ProjectManagementComponent{

    entity: any = {}

    clientList: any[] = []
    selectedClient: any = {}
    contractList: any[] = []
    batchList: any[] = []
    sampleList: any[] = []
    showHistory: any = {}
    skip = 0
    queryCode: string = ''
    queryValue: string = ''
    queryDateStart: string =''
    queryDateEnd: string =''

    constructor(
        public dialog: MatDialog,
        private entityService: EntityService,
        public sampleService: SampleService,
        private snackBar: MatSnackBar,
    ){}

    ngOnInit(){
        this.entityService.retrieveByIdentifierFull(
            "/PROJECT_MANAGEMENT/GENERAL_PROJECT")
            .subscribe(data => {
                this.entity = data[0]
                this.getSampleList()
            })
    }

    getSampleList(){
        let sortStart = ''
        let sortEnd = ''
        let option = `&where={"SYS_DATE_TERMINATED":{"exists":false}}` +
            "&limit=10" +
            "&sort=-createdAt" +
            "&skip=" +
            this.skip
        if (this.queryCode == '' && this.queryCode != "") {
            this.showMessage("Please take an attribute.")
            return
        }
        if (this.queryCode != '' && this.queryCode != 'SYS_DATE_COMPLETED') {
            if (this.queryValue != '') {
                option += `&where={"${this.queryCode}":{"regex":".*${this.queryValue}.*"}}`
            } else {
                this.showMessage("Please input the value.")
                return
            }
        }
        if (this.queryCode == 'SYS_DATE_COMPLETED') {
            if (this.queryDateStart == '' && this.queryDateEnd == ''){
                this.showMessage("Please input the date.")
                return
            }
            if (this.queryDateStart != ''){
                sortStart = this.queryDateStart
            }
            if (this.queryDateEnd != ''){
                sortEnd = this.queryDateEnd
            }
        }

        this.entityService.retrieveEntity(
            this.entity.id,
            "collection",
            option
        )
        .subscribe(data => {
            this.sampleList = data
            .filter(sample => {
                if (sortStart == '' && sortEnd == ''){
                    return true
                }
                if (sortStart != '' && sortEnd == ''){
                    return new Date(sample['SYS_DATE_COMPLETED']) > new Date(sortStart)
                }
                if (sortStart == '' && sortEnd != ''){
                    return new Date(sample['SYS_DATE_COMPLETED']) < new Date(sortEnd)
                }
                if (sortStart != '' && sortEnd != ''){
                    return (new Date(sample['SYS_DATE_COMPLETED']) > new Date(sortStart)) &&
                        (new Date(sample['SYS_DATE_COMPLETED']) < new Date(sortEnd))
                }
            })

            this.sampleList.forEach(sample => {
                // excel plugin only export checked sample
                sample.TMP_CHECKED = true
            })
        })
    }

    nextPage(){
        this.skip += 10
        this.getSampleList()
    }

    prevPage(){
        this.skip -= 10
        if (this.skip <= 0) {
            this.skip = 0
        }
        this.getSampleList()
    }

    showMessage(msg: string) {
        this.snackBar.open(msg, 'OK', {duration: 3000});
    }


    openNewEntityDialog(entity: any) {
        let dialogRef = this.dialog.open(SampleFormDialog, {height:'70%', width: '70%'});
        dialogRef.componentInstance.config.entity = entity
        dialogRef.componentInstance.config.issueSample = true
        //dialogRef.componentInstance.config.sampleList = this.sampleList.filter(sample => sample.TMP_CHECK)
        dialogRef.componentInstance.config.sampleList = [{}]
        dialogRef.afterClosed().subscribe(result => {
            //this.sampleList = this.sampleList.filter(sample => !sample.TMP_CHECK)
            this.getSampleList()
        });
    }

    openEditEntityDialog(sample: any) {
        let dialogRef = this.dialog.open(EditPMSampleDialog, {height:'70%', width: '70%'});
        dialogRef.componentInstance.config.entity = this.entity
        dialogRef.componentInstance.config.sampleEdited = sample
        dialogRef.afterClosed().subscribe(result => {
            //this.sampleList = this.sampleList.filter(sample => !sample.TMP_CHECK)
            this.getSampleList()
        });
    }

    clearQuery(){
        this.queryCode = ''
        this.queryValue = ''
        this.getSampleList()
    }

    openSuspendSampleDialog(sample: any, isSuspended: boolean){
        let data = {sample: sample, isSuspended: isSuspended, remark: ""}
        let dialogRef = this.dialog.open(SuspendSampleDialog, {
            width: '50%',
            data: data,
        })
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (isSuspended) {
                    this.suspendSample(sample, data.remark)
                } else {
                    this.resumeSample(sample, data.remark)
                }
            }
        })
    }

    suspendSample(sample: any, remark: string){
        this.sampleService.suspendSample(sample, remark)
        .subscribe(data => {
            console.log("SUSPEND", data)
            this.showMessage("Sample '" + data['SYS_SAMPLE_CODE'] +"' has been suspended")
        })
    }

    resumeSample(sample: any, remark: string){
        this.sampleService.resumeSample(sample, remark)
        .subscribe(data => {
            this.showMessage("Sample '" + data['SYS_SAMPLE_CODE'] +"' has been resumed")
        })
    }
}
