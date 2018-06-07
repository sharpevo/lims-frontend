import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {AttributeService} from '../attribute/service'
import {SampleService} from '../models/sample'
import {Observable} from 'rxjs/Observable'

@Component({
    selector: 'plugin-index-validator',
    templateUrl: './index.validator.html',
    styleUrls: ['./index.validator.css']
})
export class PluginIndexValidatorComponent {
    indexSysCodeList: any[] = [
        "SYS_INDEX_TPE_1",
        "SYS_INDEX_TPE_2",
        "SYS_INDEX_IGT_I5",
        "SYS_INDEX_IGT_I7",
    ]
    sequenceSysCodeList: any[] = [
        "SYS_INDEX_EXT_SEQUENCE_I5",
        "SYS_INDEX_EXT_SEQUENCE_I7",
    ]

    @Input() sampleList
    selectedSampleList: any[] = []
    result: boolean = true
    previousCheckedList: boolean[] = []
    resultList: boolean[] = []
    codeMap: any = {
        "MI7_SEQN_KEY": "SYS_M_INDEX_SEQUENCE_I7",
        "MI7_CODE_KEY": "SYS_M_INDEX_CODE_I7",
        "MI5_SEQN_KEY": "SYS_M_INDEX_SEQUENCE_I5",
        "MI5_CODE_KEY": "SYS_M_INDEX_CODE_I5",
        "SI7_SEQN_KEY": "SYS_S_INDEX_SEQUENCE_I7",
        "SI7_CODE_KEY": "SYS_S_INDEX_CODE_I7",
    }
    genreMap: any = {}
    sampleMap: any = {}
    seqMap: any = {}
    test: string = ''

    resultMap: any = {}
    keyMap: any = {}

    constructor(
        private entityService: EntityService,
        private attributeService: AttributeService,
        private sampleService: SampleService,
    ) {}

    ngOnInit() {
        this.updatePreviousCheckedList()

        this.indexSysCodeList.concat(this.sequenceSysCodeList).forEach(key => {
            this.attributeService.retrieveBy({
                "SYS_CODE": key
            }).subscribe(data => {
                this.genreMap[key] = data[0].SYS_GENRE.id
            })
        })
    }

    ngDoCheck() {
        if (this.isSampleListChanged()) {
            this.validateIndices()
        }
    }

    updatePreviousCheckedList() {
        this.previousCheckedList = []
        for (let i = 0; i < this.sampleList.length; i++) {
            let sample = this.sampleList[i]
            if (sample['TMP_CHECKED']) {
                this.previousCheckedList.push(true)
            } else {
                this.previousCheckedList.push(false)
            }
        }
    }

    isSampleListChanged(): boolean {
        for (let i = 0; i < this.sampleList.length; i++) {
            let sample = this.sampleList[i]
            if (sample['TMP_CHECKED'] != null &&
                sample['TMP_CHECKED'] != this.previousCheckedList[i]) {

                if (!sample['TMP_CHECKED']) { // uncheck
                    delete this.keyMap[sample.id]
                    delete this.resultMap[sample.id]
                    delete this.sampleMap[sample.id]
                    this.result = true
                    this.sampleList.filter(sample => sample.TMP_CHECKED).forEach((sample, index) => {
                        if (!this.checkSequence(sample.id, index)) {
                            this.result = false
                        }
                    })
                }

                this.updatePreviousCheckedList()
                return true
            }
        }
        return false
    }

    validateIndices() {

        this.selectedSampleList = this.sampleList.filter(sample => sample.TMP_CHECKED)
        this.resultList = []
        this.seqMap = []

        let toParsedSampleList = this.selectedSampleList.filter(sample => !this.sampleMap[sample.id])

        if (toParsedSampleList.length == 0) {
            return
        }
        let sampleObs = []
        for (let i = 0; i < toParsedSampleList.length; i++) {
            let sample = toParsedSampleList[i]
            this.resultList[i] = true

            this.sampleMap[sample.id] = {}
            this.indexSysCodeList.forEach(key => {
                sampleObs.push(
                    this.sampleService.retrieveAuxiliaryAttributeList(
                        sample,
                        key,
                        this.genreMap[key]
                    ).mergeMap(data => {
                        //console.log("auxi", data)
                        if (data.length == 0 || data[0].value.length != 24) { // eliminate '---'
                            return Observable.of({'key': key, 'value': '', 'sampleId': sample.id, 'index': i})
                        }
                        let id = data[0].value
                        return this.entityService.retrieveBy({
                            "_id": data[0].value, // latest value ?
                        }).map(indexEntity => {
                            return {'key': key, 'value': indexEntity[0]['SYS_INDEX_SEQUENCE'], 'sampleId': sample.id, 'index': i}
                        })
                    })
                )
            })
            this.sequenceSysCodeList.forEach(key => {
                sampleObs.push(
                    this.sampleService.retrieveAuxiliaryAttributeList(
                        sample,
                        key,
                        this.genreMap[key]
                    ).map(data => {
                        if (data.length == 0) {
                            return {
                                'key': key,
                                'value': '',
                                'sampleId': sample.id,
                                'index': i
                            }
                        } else {
                            return {
                                'key': key,
                                'value': data[0]['value'],
                                'sampleId': sample.id,
                                'index': i
                            }
                        }
                    })
                )
            })
        } // end of for loop

        Observable
            .forkJoin(sampleObs)
            .subscribe(data => {
                console.log("DATA", data)
                data.forEach(result => {
                    let key = result['key']
                    let attr = result['value'] ? result['value'] : ''
                    let sampleId = result['sampleId']
                    let index = result['index']
                    this.sampleMap[sampleId][key] = attr
                })

                toParsedSampleList.forEach((sample, index) => {
                    this.checkSequence(sample.id, index)
                })

            })

    }

    checkSequence(sampleId: string, index: number): boolean {
        let tpe1 = this.sampleMap[sampleId]["SYS_INDEX_TPE_1"] ? this.sampleMap[sampleId]["SYS_INDEX_TPE_1"] : ''
        let tpe2 = this.sampleMap[sampleId]["SYS_INDEX_TPE_2"] ? this.sampleMap[sampleId]["SYS_INDEX_TPE_2"] : ''
        let igt1 = this.sampleMap[sampleId]["SYS_INDEX_IGT_I5"] ? this.sampleMap[sampleId]["SYS_INDEX_IGT_I5"] : ''
        let igt2 = this.sampleMap[sampleId]["SYS_INDEX_IGT_I7"] ? this.sampleMap[sampleId]["SYS_INDEX_IGT_I7"] : ''
        let ext1 = this.sampleMap[sampleId]["SYS_INDEX_EXT_SEQUENCE_I5"] ? this.sampleMap[sampleId]["SYS_INDEX_EXT_SEQUENCE_I5"] : ''
        let ext2 = this.sampleMap[sampleId]["SYS_INDEX_EXT_SEQUENCE_I7"] ? this.sampleMap[sampleId]["SYS_INDEX_EXT_SEQUENCE_I7"] : ''
        let key = tpe1 + tpe2 + igt1 + igt2 + ext1 + ext2

        this.keyMap[sampleId] = key
        this.resultMap[sampleId] = true
        for (let _sampleId of Object.keys(this.keyMap)) {
            if (_sampleId != sampleId &&
                this.keyMap[_sampleId] == key) {
                this.resultMap[_sampleId] = false
                this.resultMap[sampleId] = false
                this.result = false
                return this.result
            }
        }
        return this.result
    }

}
