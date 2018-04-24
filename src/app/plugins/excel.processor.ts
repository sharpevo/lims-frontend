import {Component, Input, ViewChild} from '@angular/core'
import {EntityService} from '../entity/service'
import {GenreService} from '../genre/service'
import {SampleService} from '../models/sample'
import {UtilService} from '../util/service'
import {DatePipe} from '@angular/common'
import {Router} from '@angular/router'
import {Observable} from 'rxjs/Observable'
import {UserInfoService} from '../util/user.info.service'
import {LogService} from '../log/log.service'
import {LogCall} from '../log/decorator'
import {ExcelService} from '../util/excel.service'

@Component({
    selector: 'plugin-excel-processor',
    templateUrl: './excel.processor.html',
    styleUrls: ['./excel.processor.css']
})
export class PluginExcelProcessorComponent {
    @Input() workcenter
    @Input() sampleList
    @Input() hybridObjectMap
    @Input() formObject
    @ViewChild('excelUploader') excelUploader
    selectedSampleList: any[] = []
    excelResultSample: any[] = []
    excelResultGroup: any[] = []
    parentMap: any = {} // parent entity like BoM or Routing
    parentMapKey: string = ''
    parentMapFloor: string = ''
    entityMap: any = {} // entity type like operator
    workcenterAttributeList: any[] = []

    userInfo: any = {}

    constructor(
        private utilService: UtilService,
        private entityService: EntityService,
        private genreService: GenreService,
        private sampleService: SampleService,
        private router: Router,
        private userInfoService: UserInfoService,
        public logger: LogService,
        public excelService: ExcelService,
    ) {
        this.userInfo = this.userInfoService.getUserInfo()
    }

    ngOnInit() {
        //console.log("hybridObjectMap: ", this.hybridObjectMap)
        this.generateParentMap()
    }

    generateParentMap() {
        this.excelService.getWorkcenterAttributeListFromFirstGenre$(this.workcenter.id)
            .subscribe(attributeList => {
                this.workcenterAttributeList = attributeList
                this.excelService.getParentMap$(attributeList)
                    .subscribe(parentMap => {
                        this.parentMap = parentMap
                        this.parentMapKey = Object.keys(parentMap)[0]
                        let attributeKey = Object.keys(this.parentMap[this.parentMapKey])[0]
                        this.parentMapFloor =
                            this.parentMap[this.parentMapKey][attributeKey]['SYS_FLOOR_ENTITY_TYPE']
                    })

            })

    }

    @LogCall
    submitExcel(event) {
        let file = event.srcElement.files;
        let postData = {field1: "field1", field2: "field2"}; // Put your form data variable. This is only example.
        this.utilService.postExcel(file)
            .subscribe(data => {
                this.excelResultSample = data[0]
                this.excelResultGroup = data[1]
            })
    }

    clearExcel() {
        this.excelResultSample = []
        this.excelResultGroup = []
        this.excelUploader.nativeElement.value = ''
    }

    exportSample(template?: boolean) {
        this.selectedSampleList = this.sampleList.filter(sample => sample.TMP_CHECKED)
        let hybridSampleList = this.sampleService.buildHybridSampleList(this.selectedSampleList, this.hybridObjectMap)
        this.logger.debug("HybridSampleList", hybridSampleList)

        if (this.selectedSampleList.length > 0 || template) {
            if (template) {
                hybridSampleList = []
            }
            this.utilService.getExcelFile(hybridSampleList, this.workcenter.id)
                .subscribe(data => {
                    var blob = new Blob([data['_body']], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
                    //var file = new File([blob], 'report.xlsx',{ type: 'application/vnd.ms-excel' } )
                    //var url= window.URL.createObjectURL(file)
                    //window.open(url, '_blank');
                    //window.open(url);

                    const pdfUrl = window.URL.createObjectURL(blob);
                    const anchor = document.createElement('a');

                    let timestamp = new DatePipe('en-US').transform(new Date(), 'yyyyMMdd.HHmmss')
                    anchor.download = this.workcenter[this.workcenter['SYS_LABEL']] + '.' + timestamp + '.xlsx';
                    anchor.href = pdfUrl;
                    anchor.click()
                })
        }
        this.logger.debug("ParentMap", this.parentMap)
    }

    @LogCall
    updateExcel() {
        this.excelService.updateSampleInExcelFromFormObject(
            this.excelResultSample,
            this.formObject,
            this.workcenterAttributeList,
        )

        let issueSample = !this.excelResultSample[0]['IDENTIFIER']
        let parentMap = {}

        parentMap = this.formObject['TMP_PARENT_MAP']

        let targetOutput = []
        let newSampleList = []
        this.excelService.postSampleByExcel$(
            this.workcenter,
            this.excelResultSample,
            parentMap,
            this.workcenterAttributeList,
            newSampleList,
        )
            .subscribe(
                data => {
                    this.logger.debug("UpdateExcel Response", data)
                    targetOutput.push(data)
                },
                err => {
                },
                () => {
                    this.logger.warn("targetoutput", targetOutput)
                    this.sampleService.sendMessageToDingTalk$(
                        issueSample,
                        newSampleList,
                        this.excelResultSample,
                        this.workcenterAttributeList,
                        targetOutput,
                        this.workcenter,
                    ).subscribe()

                    this.router.navigate(['/redirect' + this.router.url])
                }
            )

    }

    @LogCall
    updateExcel0() {
        let sampleListInExcel = this.excelResultSample
        let parentMap = this.parentMap
        let workcenterAttributeList = this.workcenterAttributeList

        let targetOutput = []
        let newSampleList = []
        Observable.forkJoin(
            sampleListInExcel.map(sampleInExcel => {
                let sampleInExcelId = sampleInExcel['IDENTIFIER']
                if (sampleInExcelId) {

                    this.logger.debug("Submit Sample", sampleInExcel)

                    return this.entityService.retrieveBy({
                        "_id": sampleInExcelId,
                    })
                        .mergeMap(sampleInExcelIdList => {
                            this.logger.debug("Get sample by ID", sampleInExcelIdList)
                            let sampleInDatabase = sampleInExcelIdList[0]

                            // copy values in excel to the samples in database by SYS_LABEL
                            sampleInDatabase['SYS_SCHEMA'].forEach(schema => {
                                if (sampleInExcel[schema['SYS_LABEL']]) {
                                    if (schema['SYS_TYPE'] != 'entity') {
                                        sampleInDatabase[schema['SYS_CODE']] = sampleInExcel[schema['SYS_LABEL']]
                                    } else {
                                        sampleInDatabase[schema['SYS_CODE']] = sampleInExcel[schema['SYS_LABEL']]
                                        // TODO: convert value to id
                                    }
                                }
                            })

                            newSampleList.push(sampleInDatabase)
                            return this.sampleService.submitSample$(
                                this.workcenter,
                                sampleInDatabase,
                                sampleInDatabase,
                                {
                                    "attributeList": workcenterAttributeList,
                                    "parentMap": parentMap,
                                }
                            )
                        })
                } else {

                    this.logger.debug("Issue Sample", sampleInExcel)

                    if (this.workcenter.SYS_IDENTIFIER != "/PROJECT_MANAGEMENT/GENERAL_PROJECT") {
                        this.logger.error("Not allowed to upload samples at this workcenter", this.workcenter.SYS_IDENTIFIER)
                        return
                    }

                    let newSample = {}
                    workcenterAttributeList.forEach(attribute => {
                        newSample[attribute['SYS_CODE']] = sampleInExcel[attribute[attribute['SYS_LABEL']]]
                    })

                    return this.entityService.retrieveGenre(this.workcenter.id)
                        .mergeMap(workcenterGenreList => {
                            newSample['SYS_GENRE'] = workcenterGenreList[0]
                            newSample['SYS_LABEL'] = 'SYS_SAMPLE_CODE'
                            newSample['SYS_ENTITY_TYPE'] = 'collection'
                            newSample['SYS_IDENTIFIER'] = this.workcenter['SYS_IDENTIFIER'] +
                                '/' +
                                newSample['SYS_SAMPLE_CODE'] + '.' +
                                new DatePipe('en-US').transform(new Date(), 'yyyyMMddHHmmss')

                            newSampleList.push(newSample)
                            return this.sampleService.createObject$(
                                newSample,
                                {
                                    "attributeList": workcenterAttributeList,
                                    "parentMap": parentMap,
                                },
                                true)
                        })
                }
            })
        )
            .subscribe(
                data => {
                    this.logger.debug("UpdateExcel Response", data)
                    targetOutput.push(data)
                },
                err => {
                },
                () => {
                    this.sampleService.sendMessageToDingTalk$(
                        !sampleListInExcel[0]['IDENTIFIER'], // issueSample
                        newSampleList,
                        sampleListInExcel,
                        workcenterAttributeList,
                        targetOutput,
                        this.workcenter,
                    ).subscribe()

                    this.router.navigate(['/redirect' + this.router.url])
                }
            )
    }

    @LogCall
    updateExcel1() {

        // update the parentMap according to the excel if another sheets provides some.
        if (this.excelResultGroup.length > 0) {
            this.parentMap = {}
            this.parentMap[this.parentMapKey] = {}
        }

        let groupObservableList = []
        //console.log("excelResultGroup: ", this.excelResultGroup)
        this.excelResultGroup.forEach(groupInExcel => {

            this.logger.debug("GroupInExcel", groupInExcel)
            // groupId indicates the workcenter or the material itself
            let groupId = groupInExcel['IDENTIFIER']
            if (groupId) {

                // retrieve the group item (object with the given id)
                groupObservableList.push(
                    this.entityService.retrieveBy({"_id": groupId})
                        .mergeMap(data => {
                            //.subscribe(data => {
                            let group = data[0]

                            this.logger.debug("Group", group)
                            if (this.parentMapFloor == "collection") {
                                // bom, get the first lot for uploading / default
                                // sort by the lot label

                                // retrive collections/LOTs under the given material
                                return this.entityService.retrieveEntity(group['SYS_SOURCE'], "collection")
                                    .mergeMap(data => {
                                        //.subscribe(data => {

                                        this.logger.debug("Material", data)
                                        // get the delfault lot in the array sorted by the SYS_CODE
                                        // e.g. LOT160810
                                        let defaultMaterial = {}

                                        // get the default material
                                        let defaultMaterialList = data.filter(material => material['SYS_IS_DEFAULT'])
                                        if (defaultMaterialList.length > 0) {
                                            defaultMaterial = defaultMaterial[0]
                                        } else {
                                            // if default flag is not set well, get the oldest lot
                                            defaultMaterial = data.sort((a, b) => {
                                                if (a['createAt'] < b['createdAt']) {
                                                    return 1
                                                } else {
                                                    return -1
                                                }
                                            })[0]
                                        }
                                        groupId = defaultMaterial['id']

                                        this.logger.debug("GroupId", groupId)
                                        this.parentMap[this.parentMapKey][groupId] = {}
                                        group.SYS_SCHEMA.forEach(schema => {
                                            Object.keys(groupInExcel).forEach(key => {
                                                if (schema.SYS_LABEL == key) {
                                                    //console.log("Schema vs. key: ", schema.SYS_CODE, key)
                                                    this.parentMap[this.parentMapKey][groupId][schema.SYS_CODE] = groupInExcel[key]
                                                }
                                            })
                                        })
                                        //this.parentMap[this.parentMapKey][groupId]['SYS_QUANTITY'] = groupInExcel['Duration']
                                        //this.parentMap[this.parentMapKey][groupId]['SYS_ORDER'] = groupInExcel['Order']
                                        this.parentMap[this.parentMapKey][groupId]['SYS_SOURCE'] = groupId // defaultMaterial
                                        this.parentMap[this.parentMapKey][groupId]['SYS_CHECKED'] = true
                                        this.parentMap[this.parentMapKey][groupId]['SYS_FLOOR_ENTITY_TYPE'] = this.parentMapFloor
                                        return Observable.of("1")
                                    })
                            } else {

                                this.logger.debug("GroupId", groupId)
                                this.parentMap[this.parentMapKey][groupId] = {}
                                group.SYS_SCHEMA.forEach(schema => {
                                    Object.keys(groupInExcel).forEach(key => {
                                        //console.log("Schema vs. key: ", schema.SYS_LABEL, key)
                                        if (schema.SYS_LABEL == key) {
                                            this.parentMap[this.parentMapKey][groupId][schema.SYS_CODE] = groupInExcel[key] // overwrited by the backend data
                                        }
                                    })
                                })
                                //this.parentMap[this.parentMapKey][groupId]['SYS_DURATION'] = groupInExcel['Duration']
                                //this.parentMap[this.parentMapKey][groupId]['SYS_ORDER'] = groupInExcel['Order']
                                this.parentMap[this.parentMapKey][groupId]['SYS_SOURCE'] = group['SYS_SOURCE']
                                //this.parentMap[this.parentMapKey][groupId]['SYS_SOURCE'] = groupId
                                this.parentMap[this.parentMapKey][groupId]['SYS_CHECKED'] = true // mimic submited in the form
                                this.parentMap[this.parentMapKey][groupId]['SYS_FLOOR_ENTITY_TYPE'] = this.parentMapFloor
                                return Observable.of("1")
                            }
                        })
                    //.delay(1000)
                )
            }
        })

        this.logger.debug("ParentMap New", this.parentMap)

        //return
        //}
        //updateExcelRaw(){

        this.logger.debug("ExcelResultSample", this.excelResultSample)

        let mergedSampleList = []
        Observable.concat(...groupObservableList)
            .subscribe(data => {}, err => {}, () => {

                let sampleMessageList = []
                let sampleObservableList = []

                this.excelResultSample.forEach(sample => {

                    let sampleId = sample['IDENTIFIER']
                    if (sampleId) {
                        // Convert excel-style object to database-style object.
                        // The excel-style object is formed as:
                        // 'LABEL': 'Value'
                        sampleObservableList.push(
                            this.entityService.retrieveBy({
                                "_id": sampleId
                            })
                                .mergeMap(data => {
                                    let mergedSample = data[0]

                                    //
                                    // For the reason of SYS_GENRE is defined from General project instead
                                    // of the current workcenter in the legacy database:
                                    // 1. schema: from workcenter, like sample sn
                                    // 2. sample: from excel, like operator, id, exactly the workcenter
                                    //
                                    mergedSample.SYS_SCHEMA.forEach(schema => {

                                        this.logger.debug("SampleSchema", sample, schema)
                                        if (sample[schema.SYS_LABEL]) {
                                            if (schema.SYS_TYPE != 'entity') {
                                                mergedSample[schema.SYS_CODE] = sample[schema.SYS_LABEL]
                                            } else {
                                                mergedSample[schema.SYS_CODE] = sample[schema.SYS_LABEL]

                                                // TODO: Convert SYS_LABEL to id before commit to the database
                                                //let queryObject = {}
                                                //queryObject[schema.SYS_LABEL] = sample[schema.SYS_LABEL]
                                                //this.entityService.retrieveBy(queryObject)
                                                //.subscribe(data => {
                                                //if (data[0]){
                                                //console.log("Entity:", data[0])
                                                //mergedSample[schema.SYS_CODE] = data[0].id
                                                //} else {
                                                //console.warn("Invalid " + schema.SYS_LABEL + sample[schema.SYS_LABEL])
                                                //}
                                                //})
                                            }
                                        }
                                    })


                                    //sampleMessageList.push('>- ' + mergedSample.SYS_SAMPLE_CODE + '\n\n')
                                    sampleMessageList.push(mergedSample.SYS_SAMPLE_CODE)
                                    mergedSampleList.push(mergedSample)
                                    return this.sampleService.submitSample$(
                                        this.workcenter,
                                        mergedSample,
                                        data[0],
                                        {
                                            "attributeList": this.workcenterAttributeList,
                                            "parentMap": this.parentMap
                                        })
                                    //.mergeMap(data => {
                                    //sampleMessageList.push('>- ' + mergedSample.SYS_SAMPLE_CODE)
                                    //})
                                })
                        )
                    } else {
                        // issue sample

                        // only allow sample creation at General Project Workcenter
                        if (this.workcenter.SYS_IDENTIFIER != "/PROJECT_MANAGEMENT/GENERAL_PROJECT") {
                            console.error("Not allowed to upload samples at this workcenter", this.workcenter.SYS_IDENTIFIER)
                            return
                        }

                        let newSample = {}
                        this.workcenterAttributeList.forEach(attr => {
                            newSample[attr.SYS_CODE] = sample[attr[attr['SYS_LABEL']]]
                        })

                        sampleObservableList.push(
                            this.entityService.retrieveGenre(this.workcenter.id)
                                .mergeMap(data => {
                                    //.subscribe(data => {
                                    newSample['SYS_GENRE'] = data[0]
                                    newSample['SYS_LABEL'] = 'SYS_SAMPLE_CODE'
                                    newSample['SYS_ENTITY_TYPE'] = 'collection'

                                    newSample['SYS_IDENTIFIER'] = this.workcenter['SYS_IDENTIFIER'] +
                                        '/' +
                                        newSample['SYS_SAMPLE_CODE'] + '.' +
                                        new DatePipe('en-US').transform(new Date(), 'yyyyMMddHHmmss')

                                    mergedSampleList.push(newSample)
                                    return this.sampleService.createObject$(
                                        newSample,
                                        {
                                            "attributeList": this.workcenterAttributeList,
                                            "parentMap": this.parentMap,
                                        },
                                        true)
                                })
                            //.delay(100)
                        )

                    }
                })

                let targetOutput = []
                Observable.concat(...sampleObservableList)
                    .subscribe(
                        data => {
                            targetOutput.push(data)
                        },
                        err => {
                        },
                        () => {
                            this.sampleService.sendMessageToDingTalk$(
                                sampleMessageList.length == 0,
                                mergedSampleList,
                                this.excelResultSample,
                                this.workcenterAttributeList,
                                targetOutput,
                                this.workcenter,
                            ).subscribe()

                            this.router.navigate(['/redirect' + this.router.url])
                        })
            })

    }

    updateExcel2() {
        this.utilService.putExcel(this.excelResultSample)
            .subscribe(data => {
                console.log(data)
                this.selectedSampleList.forEach(sample => sample.TMP_CHECKED = false)
            })
    }

}

