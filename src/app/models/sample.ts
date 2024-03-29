import {Injectable} from '@angular/core'
import {EntityService} from '../entity/service'

import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/forkJoin'
import 'rxjs/add/observable/range'
import 'rxjs/add/observable/timer'
import 'rxjs/add/observable/concat'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/zip'
import 'rxjs/add/operator/retryWhen'

import {GenreService} from '../genre/service'
import {UtilService} from '../util/service'

import {MatSnackBar} from '@angular/material'
import {UserInfoService} from '../util/user.info.service'

import {Router} from '@angular/router'
import {DatePipe} from '@angular/common'

import {environment} from '../../environments/environment'

import {LogService} from '../log/log.service'
import {LogCall} from '../log/decorator'

@Injectable()
export class SampleService {

    userInfo: any = {}

    ignoredAttribute: any = {
        "SYS_WORKCENTER_OPREATOR": true,
        //"SYS_DATE_COMPLETED":false,
        "SYS_DATE_SCHEDULED": true,
    }

    constructor(
        public snackBar: MatSnackBar,
        public genreService: GenreService,
        public utilService: UtilService,
        public userInfoService: UserInfoService,
        public router: Router,
        public entityService: EntityService,
        public logger: LogService,
    ) {
        this.userInfo = this.userInfoService.getUserInfo()
    }

    /**
     * Get all the attributes of the given sample and SYS_CODE, including history
     * values.
     *
     * @param sample the target sample to get attributes
     * @param attributeCode the SYS_CODE of the auxiliary attribute
     * @param callback assignment usually
     *
     */
    getAuxiliaryAttributeList(sample: any, attributeCode: string, attributeGenre: string, callback) {

        // Get the latest sample
        this.entityService.retrieveBy({
            "SYS_SAMPLE_CODE": sample['SYS_SAMPLE_CODE']
        })
            .subscribe(_sampleList => {

                let sampleList = _sampleList
                    .sort((a, b) => {
                        //if (a['updatedAt'] < b['updatedAt']){
                        if (a['SYS_DATE_COMPLETED'] < b['SYS_DATE_COMPLETED']) {
                            return 1
                        } else {
                            return -1
                        }
                    })
                let attributeObjectList = []

                let activatedSampleList = sampleList
                    .filter(sample => sample['SYS_DATE_COMPLETED'])// &&
                //!sample['SYS_DATE_TERMINATED'])
                if (activatedSampleList.length > 0) {
                    let uniqueSampleList = []
                    let seen = {}
                    activatedSampleList.forEach(sample => {
                        let key = attributeCode == 'SYS_SAMPLE_CODE' ? attributeCode : attributeCode + "|" + sample['SYS_GENRE'] + sample[attributeCode]
                        if (!seen[key]) {
                            if (sample[attributeCode]) {
                                seen[key] = true
                            }

                            if (attributeGenre == sample['SYS_GENRE'] || attributeCode == "SYS_SAMPLE_CODE") {
                                uniqueSampleList.push(sample)
                            }
                        }
                    })

                    uniqueSampleList
                        .forEach(sample => {
                            attributeObjectList.push({
                                "id": sample.id,
                                "dateCompleted": sample['SYS_DATE_COMPLETED'],
                                "dateUpdated": sample['updatedAt'],
                                "value": sample[attributeCode] ? sample[attributeCode] : "---"
                            })
                        })
                } else {
                    // For samples that are just submitted, none of which satisfied the
                    // date condition, so push the attributes of the first sample.
                    let firstSample = sampleList[0]
                    attributeObjectList.push({
                        "id": firstSample.id,
                        "dateCompleted": firstSample['SYS_DATE_COMPLETED'],
                        "dateUpdated": firstSample['updatedAt'],
                        "value": firstSample[attributeCode] ? firstSample[attributeCode] : "---"
                    })
                }

                callback(attributeObjectList)
            })
    }
    getAuxiliaryAttributes(sample: any, sampleSet: any[], attributeCode: string, attributeGenre: string) {

        let sampleList = sampleSet
            .sort((a, b) => {
                //if (a['updatedAt'] < b['updatedAt']){
                if (a['SYS_DATE_COMPLETED'] < b['SYS_DATE_COMPLETED']) {
                    return 1
                } else {
                    return -1
                }
            })
        let attributeObjectList = []

        let activatedSampleList = sampleList
            .filter(sample => {
                if (sample['SYS_DATE_COMPLETED']) {
                    return true
                }
                if (!sample['SYS_DATE_COMPLETED'] && sample['SYS_IDENTIFIER'].startsWith('/PROJECT_MANAGEMENT')) {
                    return true
                }
                return false
            })// &&
        //!sample['SYS_DATE_TERMINATED'])
        if (activatedSampleList.length > 0) {
            let uniqueSampleList = []
            let seen = {}
            activatedSampleList.forEach(sample => {
                let key = attributeCode == 'SYS_SAMPLE_CODE' ? attributeCode : attributeCode + "|" + sample['SYS_GENRE'] + sample[attributeCode]
                if (!seen[key]) {
                    if (sample[attributeCode]) {
                        seen[key] = true
                    }

                    if (sample.hasOwnProperty(attributeCode)) {
                        uniqueSampleList.push(sample)
                    }
                }
            })

            uniqueSampleList
                .forEach(sample => {
                    attributeObjectList.push({
                        "id": sample.id,
                        "dateCompleted": sample['SYS_DATE_COMPLETED'],
                        "dateUpdated": sample['updatedAt'],
                        "value": sample.hasOwnProperty(attributeCode) ? sample[attributeCode] : "---"
                    })
                })
        } else {
            // For samples that are just submitted, none of which satisfied the
            // date condition, so push the attributes of the first sample.
            let firstSample = sampleList[0]
            attributeObjectList.push({
                "id": firstSample.id,
                "dateCompleted": firstSample['SYS_DATE_COMPLETED'],
                "dateUpdated": firstSample['updatedAt'],
                "value": firstSample.hasOwnProperty(attributeCode) ? firstSample[attributeCode] : "---"
            })
        }
        return attributeObjectList
    }

    retrieveAuxiliaryAttributeList(sample: any, attributeCode: string, attributeGenre: string) {
        if (!attributeGenre) {
            return Observable.of([''])
        }

        return this.genreService.retrieveBy({
            "_id": attributeGenre,
        }).mergeMap(genreList => {
            let genre = genreList[0]
            return this.genreService.retrieveBy({
                "SYS_ENTITY": genre['SYS_ENTITY'].id
            }).mergeMap(genreList => {

                // Get the latest sample
                return this.entityService.retrieveBy({
                    "SYS_SAMPLE_CODE": sample['SYS_SAMPLE_CODE']
                })
                    .map(_sampleList => {

                        let sampleList = _sampleList
                            .sort((a, b) => {
                                //if (a['updatedAt'] < b['updatedAt']){
                                if (a['SYS_DATE_COMPLETED'] < b['SYS_DATE_COMPLETED']) {
                                    return 1
                                } else {
                                    return -1
                                }
                            })
                        let attributeObjectList = []

                        let activatedSampleList = sampleList
                            .filter(sample => sample['SYS_DATE_COMPLETED'])// &&
                        //!sample['SYS_DATE_TERMINATED'])
                        if (activatedSampleList.length > 0) {
                            let uniqueSampleList = []
                            let seen = {}
                            activatedSampleList.forEach(sample => {
                                let key = attributeCode + "|" + sample[attributeCode]
                                let isValidGenre = genreList.map(genre => genre.id).indexOf(sample['SYS_GENRE']) >= 0
                                if (!seen[key]) {
                                    if (sample[attributeCode] && isValidGenre) {
                                        seen[key] = true
                                    }

                                    if (isValidGenre) {// ||
                                        //console.log("GC", genreList.map(genre => genre.id).indexOf(sample['SYS_GENRE']), attributeCode, genreList, sample['SYS_GENRE'], sample.id)
                                        uniqueSampleList.push(sample)
                                    }
                                }
                            })
                            //console.log("US", uniqueSampleList)

                            uniqueSampleList
                                .forEach(sample => {
                                    attributeObjectList.push({
                                        "id": sample.id,
                                        "dateCompleted": sample['SYS_DATE_COMPLETED'],
                                        "dateUpdated": sample['updatedAt'],
                                        "value": sample[attributeCode] ? sample[attributeCode] : ""
                                    })
                                })
                        } else {
                            // For samples that are just submitted, none of which satisfied the
                            // date condition, so push the attributes of the first sample.
                            let firstSample = sampleList[0]
                            attributeObjectList.push({
                                "id": firstSample.id,
                                "dateCompleted": firstSample['SYS_DATE_COMPLETED'],
                                "dateUpdated": firstSample['updatedAt'],
                                "value": firstSample[attributeCode] ? firstSample[attributeCode] : ""
                            })
                        }
                        return attributeObjectList
                    })
            })
        })
    }

    /**
     * Build samples in backend-friendly hybrid structure.
     *
     * With the help of the backend, each of the sample will be returned with an attribute "SYS_HYBRID_INFO" which is formed like,
     *
     * SYS_HYBRID_INFO: {
     *    HYBRID_CODE: "SYS_CAPTURE_CODE"
     *    SYS_CAPTURE_CODE:"cap-aa"
     *    type:"CAPTURE"
     * }
     *
     * @param sampleList samples to build
     *
     */
    buildHybridSampleList(sampleList: any, hybridAttributeMap: any): any {

        let hybridObjectMap = {}
        sampleList.forEach(sample => {
            if (!hybridObjectMap[sample.id]) {
                hybridObjectMap[sample.id] = {}
            }
            if (!hybridObjectMap[sample.id]['attributeObject']) {
                hybridObjectMap[sample.id]['attributeObject'] = {}
            }
            hybridObjectMap[sample.id]['attributeObject'] = hybridAttributeMap[sample['SYS_SAMPLE_CODE']]
            if (!hybridObjectMap[sample.id]['sampleIdList']) {
                hybridObjectMap[sample.id]['sampleIdList'] = []
            }
            hybridObjectMap[sample.id]['sampleIdList'].push(sample.id)
        })
        return hybridObjectMap
    }

    parsePreviousSample(sample: any, data: any[]): any {
        // get previous sample
        let index = -1
        let previousSample = {}

        for (let i = 0; i < data.length; i++) {
            if (data[i].id == sample.id) {
                index = i
                break
            }
        }

        if (index < 0) {
            return
        }
        if (index == 0) {
            previousSample = sample
        }

        if (index >= 1) {
            previousSample = data[index - 1]
        }

        previousSample['TMP_NEXT_SAMPLE_ID'] = sample.id
        return previousSample
    }

    terminateSample(sample: any): any {
        sample['SYS_DATE_TERMINATED'] = new Date()
        return this.entityService.update(sample)
    }

    activateSample(sample: any): any {
        sample['SYS_DATE_TERMINATED'] = ''
        return this.entityService.update(sample)
    }

    suspendSample(sample: any, remark?: string): Observable<any> {
        sample['SYS_SUSPENSION'] = {
            DATE: new Date(),
            OPERATOR: this.userInfo.limsid,
            REMARK: remark,
        }
        return this.entityService.update(sample)
    }

    resumeSample(sample: any, remark?: string): Observable<any> {
        let resumption = {
            SUSPENSION: sample['SYS_SUSPENSION'],
            DATE: new Date(),
            OPERATOR: this.userInfo.limsid,
            REMARK: remark,
        }
        if (!sample['SYS_RESUMPTION']) {
            sample['SYS_RESUMPTION'] = []
        }
        sample['SYS_RESUMPTION'].push(resumption)
        sample['SYS_SUSPENSION'] = null
        return this.entityService.update(sample)
    }

    isSuspended(sampleCode: any): Observable<any> {
        return this.entityService.retrieveBy({
            SYS_SAMPLE_CODE: sampleCode
        }).map(samples => {
            for (let sample of samples) {
                if (sample['SYS_SUSPENSION'] &&
                    Object.keys(sample['SYS_SUSPENSION']).length > 0) {
                    return true
                }
            }
            return false
        })
    }

    terminateSampleObs(sample): Observable<any> {
        return this.entityService.retrieveBy(
            {
                'SYS_SAMPLE_CODE': sample['SYS_SAMPLE_CODE'],
                'sort': 'SYS_DATE_SCHEDULED'
            }
        ).map(samples => {
            let terminateObs = []
            samples.forEach(sampleItem => {
                let sampleDate = new Date(sampleItem['SYS_DATE_SCHEDULED'])
                let refSampleDate = new Date(sample['SYS_DATE_SCHEDULED'])
                if (sampleDate >= refSampleDate ||
                    sampleItem['SYS_GENRE_IDENTIFIER'] == '/PROJECT_MANAGEMENT/GENERAL_PROJECT/') {
                    sampleItem['SYS_DATE_TERMINATED'] = new Date()
                    terminateObs.push(
                        this.entityService.update(sampleItem))
                }
            })
            return terminateObs
        })

    }

    retrieveRootTarget(sampleId: string): string {
        this.entityService.retrieveBy({id: sampleId})
            .subscribe(data => {
                this.logger.debug("Analyze target", data)
                if (data['SYS_TARGET']) {
                    this.retrieveRootTarget(data['SYS_TARGET']['id'])
                } else {
                    return data['SYS_TARGET']
                }
            })

        return ''
    }

    getHybridInfo(sample: any): any {

        let runString = 'SYS_RUN_CODE'
        let lanString = 'SYS_LANE_CODE'
        let capString = 'SYS_CAPTURE_CODE'
        let runCode = sample[runString]
        let lanCode = sample[lanString]
        let capCode = sample[capString]

        if (runCode) {
            return {
                "type": "RUN",
                [runString]: runCode
            }
        }
        if (lanCode) {
            return {
                "type": "LANE",
                [lanString]: lanCode
            }
        }
        if (capCode) {
            return {
                "type": "CAPTURE",
                [capString]: capCode
            }
        }
    }


    /**
     * Submit samples in the form for both of issueSample of Project Manager and
     * submitSample of Product Operator, and issueSample and submitSample will
     * call createObject latter.
     *
     * @param workcenter Current workcenter, or "General Project" for issueSample
     * @param sampleList Selected samples, the sample list should belongs to the
     * current workcenter rather the previous one.
     * @param issueSample Boolean tag to indicate whether it's called from
     * Project Manager or not.
     * @param object Object manipulated in the form of web page.
     * @param parentMap BoM/Routing object.
     *
     */
    @LogCall
    submitObject(workcenter: any, sampleList: any[], issueSample: boolean, object: any, parentMap: any) {

        // Find the user in the lims by the user email.
        // For the mismatched user, they are illegal to submit any samples.
        if (!this.userInfo.limsid) {
            this.logger.error("Illegal user", this.userInfo)
            this.showMessage("Invalid user: " + this.userInfo.email, "OK")
            return
        }

        this.entityService.retrieveGenre(workcenter.id)
            .subscribe(data => {
                // Take the first genre as default
                this.genreService.retrieveAttribute(data[0].id)
                    .subscribe(data => {

                        //data.forEach(attribute => {
                        //switch (attribute.SYS_TYPE){
                        //case "entity":
                        //if (attribute.SYS_TYPE_ENTITY_REF){
                        //// get the identifier of the entity
                        //// TODO: save SYS_IDENTIFIER instead of ID seems better
                        //// or automate populate
                        //this.entityService.retrieveById(attribute.SYS_TYPE_ENTITY.id)
                        //.subscribe(data => {
                        //// get the entity list
                        //if (!attribute.SYS_FLOOR_ENTITY_TYPE){
                        //attribute.SYS_FLOOR_ENTITY_TYPE = "object"
                        //}
                        //this.entityService.retrieveByIdentifierAndCategory(
                        //data.SYS_IDENTIFIER,
                        //attribute.SYS_FLOOR_ENTITY_TYPE)
                        //.subscribe(data => {
                        //// compose a new key
                        //attribute[attribute.SYS_CODE + "_ENTITY_LIST"] = data
                        //})
                        //})
                        //}else {
                        //}
                        //console.log(">-", attribute.SYS_CODE)
                        //if (!attribute.SYS_TYPE_ENTITY_REF) {
                        //parentMap[attribute.SYS_CODE] = {}
                        //}
                        //break
                        //default:
                        //}

                        //})

                        let attributeList = data.sort((a, b) => {
                            if (a.SYS_ORDER > b.SYS_ORDER) {
                                return 1
                            } else {
                                return -1
                            }
                        })
                        let attributeInfo = {
                            "attributeList": attributeList,
                            "parentMap": parentMap
                        }

                        if (issueSample) {
                            this.issueSample(workcenter, object, sampleList, attributeInfo)
                            return
                        }

                        let msg_workcenter = workcenter[workcenter['SYS_LABEL']]
                        let msg_sampleCount = sampleList.length
                        let msg_sampleList = ""
                        // samples from the previous workcenter or the current one in the first
                        // workcenter with workcenter-specific attributes:
                        // - for the attributes defined by administrator, if they are same, use
                        //   the previous one
                        // - for the attributes starts with SYS, use current workcenter
                        sampleList.forEach(sample => {
                            msg_sampleList += ">- [" + sample['SYS_SAMPLE_CODE'] + "](" + sample._id + ")\n\n"
                            //this.entityService.retrieveById(sample['TMP_NEXT_SAMPLE_ID'])
                            this.entityService.retrieveById(sample.id)
                                .subscribe(data => {
                                    this.logger.debug("processing sample", data)
                                    this.submitSample(workcenter, object, data, attributeInfo)
                                })
                        })
                    })
            })


    }

    @LogCall
    submitObject$(workcenter: any, sampleList: any[], issueSample: boolean, object: any, parentMap: any): Observable<any> {
        if (!this.userInfo.limsid) {
            this.logger.error("Illegal user", this.userInfo)
            this.showMessage("Invalid user: " + this.userInfo.email, "OK")
            return Observable.throw("Invalid user: " + this.userInfo.email)
        }

        return this.entityService.retrieveGenre(workcenter.id)
            .mergeMap(data => {
                // Take the first genre as default
                return this.genreService.retrieveAttribute(data[0].id)
                    .mergeMap(data => {
                        let attributeList = data.sort((a, b) => {
                            if (a.SYS_ORDER > b.SYS_ORDER) {
                                return 1
                            } else {
                                return -1
                            }
                        })
                        let attributeInfo = {
                            "attributeList": attributeList,
                            "parentMap": parentMap
                        }

                        if (issueSample) {
                            this.issueSample(workcenter, object, sampleList, attributeInfo)
                            return
                        }

                        let msg_workcenter = workcenter[workcenter['SYS_LABEL']]
                        let msg_sampleCount = sampleList.length
                        // samples from the previous workcenter or the current one in the first
                        // workcenter with workcenter-specific attributes:
                        // - for the attributes defined by administrator, if they are same, use
                        //   the previous one
                        // - for the attributes starts with SYS, use current workcenter
                        //return Observable.forkJoin(
                        ////return Observable.concat(
                        //sampleList.map(sample => {
                        //console.log('processing candidate sample', sample)
                        ////this.entityService.retrieveById(sample['TMP_NEXT_SAMPLE_ID'])
                        //return this.entityService.retrieveById(sample.id)
                        ////.map(data => {
                        //.mergeMap(data => {
                        //console.log("processing sample:", data)
                        //return this.submitSample$(workcenter, object, data, attributeInfo)
                        //})
                        //})
                        //)
                        //.map(data => {
                        //console.log("FORKJOIN", data)
                        //return data
                        //})


                        let obs = []

                        sampleList.forEach(sample => {
                            obs.push(this.entityService.retrieveById(sample.id)
                                .mergeMap(data => {
                                    this.logger.debug("processing sample", data)
                                    return this.submitSample$(workcenter, object, data, attributeInfo)
                                }))
                        })
                        return Observable.forkJoin(obs)



                    })
            })

    }

    /**
     * issueSample will build samples for the General Project workcenter,
     * manipulated by product manager
     *
     * @param entity workcenter
     * @param object ngModel in the form
     * @param sampleList selected samples
     * @param attributeInfo argument map
     *
     */

    issueSample(entity: any, object: any, sampleList: any[], attributeInfo: any) {
        sampleList.forEach(sample => {
            if (!sample['SYS_SAMPLE_CODE']) {
                this.logger.warn("invalid sample code", sample)
            }

            // Copy attributes from object to sample
            // the object does not provide an id since the attributes are input in page
            // Keys are including
            // Assign key: TMP_CODE
            // Assign key: SYS_ENTITY_TYPE
            // Assign key: SYS_GENRE
            // Assign key: SYS_LABEL
            Object.keys(object).forEach(key => {
                sample[key] = object[key]
            })

            sample['SYS_LABEL'] = 'SYS_SAMPLE_CODE'
            sample['SYS_ENTITY_TYPE'] = 'collection'
            sample['SYS_DATE_COMPLETED'] = new Date()
            // identifier should be generated for submitting samples,
            // or updated for terminated samples.
            sample['SYS_IDENTIFIER'] = entity['SYS_IDENTIFIER'] +
                '/' +
                sample['SYS_SAMPLE_CODE'] +
                '.' +
                new DatePipe('en-US').transform(new Date(), 'yyyyMMddHHmmss') +
                '.' +
                Math.random().toString().substr(2, 4)

            // process samples already in the LIMS delete id before creation if the
            // sample is inside of LIMS
            if (sample.id) {
                //Observable.forkJoin(this.terminateSampleObs(sample))
                //.subscribe((data: any[][]) => {
                this.terminateSampleObs(sample)
                    .subscribe(terminatedObs => {
                        Observable.forkJoin(terminatedObs).subscribe(data => {
                            this.logger.debug("terminate data", data)
                            delete sample.id
                            delete sample._id
                            delete sample.SYS_TARGET
                            // create object after terminating samples
                            this.createObject(sample, attributeInfo, true)

                        })
                    })
            } else {
                this.createObject(sample, attributeInfo, true)
            }
        })
    }

    submitSample$(entity: any, object: any, selectedSample: any, attributeInfo: any) {

        return this.entityService.retrieveBy({
            'SYS_TARGET': selectedSample['SYS_TARGET'],
            'sort': 'SYS_ORDER',
        }).mergeMap(data => {
            let sample = {}
            let previousSample = this.parsePreviousSample(selectedSample, data)
            return this.entityService.retrieveAttribute(previousSample.id)
                .mergeMap(data => {
                    //data.forEach(attribute => {
                    //sample[attribute['SYS_CODE']] = previousSample[attribute['SYS_CODE']]
                    //})

                    // Copy capture/lane/run code manually
                    let captureCode = 'SYS_CAPTURE_CODE'
                    let laneCode = 'SYS_LANE_CODE'
                    let runCode = 'SYS_RUN_CODE'
                    if (previousSample[captureCode]) {
                        sample[captureCode] = previousSample[captureCode]
                    }
                    if (previousSample[laneCode]) {
                        sample[laneCode] = previousSample[laneCode]
                    }
                    if (previousSample[runCode]) {
                        sample[runCode] = previousSample[runCode]
                    }

                    // Copy attributes from object to sample
                    Object.keys(object).forEach(key => {
                        sample[key] = object[key]
                    })

                    // Add customized sample attribute
                    sample['SYS_IDENTIFIER'] = entity['SYS_IDENTIFIER'] + '/' +
                        selectedSample['SYS_CODE']

                    // Add default label, including SYS_SAMPLE_CODE
                    sample['SYS_LABEL'] = selectedSample['SYS_LABEL']
                    sample[sample['SYS_LABEL']] = selectedSample[selectedSample['SYS_LABEL']]

                    sample['SYS_DATE_COMPLETED'] = new Date()
                    sample['SYS_ENTITY_TYPE'] = 'collection'
                    return this.createObject$(sample, attributeInfo, false)
                })
        })

    }

    /**
     * submitSample will build samples for the specific workcenter, manipulated
     * by operators
     *
     * @param entity workcenter
     * @param object ngModel in the form
     * @param selectedSample seleted samples
     * @param attributeInfo argument map
     *
     */
    submitSample(entity: any, object: any, selectedSample: any, attributeInfo: any) {

        this.entityService.retrieveBy({
            'SYS_TARGET': selectedSample['SYS_TARGET'],
            'sort': 'SYS_ORDER',
        }).subscribe(data => {
            let sample = {}
            let previousSample = this.parsePreviousSample(selectedSample, data)
            this.entityService.retrieveAttribute(previousSample.id)
                .subscribe(data => {
                    //data.forEach(attribute => {
                    //sample[attribute['SYS_CODE']] = previousSample[attribute['SYS_CODE']]
                    //})

                    // Copy capture/lane/run code manually
                    let captureCode = 'SYS_CAPTURE_CODE'
                    let laneCode = 'SYS_LANE_CODE'
                    let runCode = 'SYS_RUN_CODE'
                    if (previousSample[captureCode]) {
                        sample[captureCode] = previousSample[captureCode]
                    }
                    if (previousSample[laneCode]) {
                        sample[laneCode] = previousSample[laneCode]
                    }
                    if (previousSample[runCode]) {
                        sample[runCode] = previousSample[runCode]
                    }

                    // Copy attributes from object to sample
                    Object.keys(object).forEach(key => {
                        sample[key] = object[key]
                    })

                    // Add customized sample attribute
                    sample['SYS_IDENTIFIER'] = entity['SYS_IDENTIFIER'] + '/' +
                        selectedSample['SYS_CODE']

                    // Add default label, including SYS_SAMPLE_CODE
                    sample['SYS_LABEL'] = selectedSample['SYS_LABEL']
                    sample[sample['SYS_LABEL']] = selectedSample[selectedSample['SYS_LABEL']]

                    sample['SYS_DATE_COMPLETED'] = new Date()
                    sample['SYS_ENTITY_TYPE'] = 'collection'
                    this.createObject(sample, attributeInfo, false)
                })
        })

    }

    createObject(sample: any, attributeInfo: any, issueSample: boolean) {
        let targetOutput = []
        this.createObject$(sample, attributeInfo, issueSample)
            .subscribe(
                data => {
                    targetOutput.push(data)
                },
                err => {
                    this.logger.error(err)
                },
                () => {
                    //this.sendMessageToDingTalk(issueSample, sample, attributeInfo['attributeList'], targetOutput)
                    //.subscribe(() => {
                    //this.router.navigate(['/redirect' + this.router.url])
                    //})

                    this.logger.debug("args", sample, attributeInfo['attributeInfo'], targetOutput)

                    this.sendMessageToDingTalk$(
                        issueSample,
                        [sample],
                        [sample],
                        attributeInfo['attributeList'],
                        targetOutput
                    )
                        .subscribe(() => {
                            this.router.navigate(['/redirect' + this.router.url])
                        })

                    //let date = new Date()
                    //let msg_date = date.getFullYear() + '-' +
                    //(date.getMonth() + 1) + '-' +
                    //date.getDate() + ' ' +
                    //date.getHours() + ':' +
                    //date.getMinutes()

                    //let message = ''
                    //if (issueSample){
                    //message = `# **${sample.SYS_SAMPLE_CODE}**\n\n${sample.CONF_GENERAL_PROJECT_PROJECT_CODE} | ${sample.CONF_GENERAL_PROJECT_PROJECT_MANAGER}\n\n`
                    //message += `scheduled to the following workcenters\n\n`
                    //} else {
                    //message = `# **${sample.SYS_SAMPLE_CODE}**\n\nsubmitted as\n\n`
                    //attributeInfo['attributeList'].forEach(attr => {
                    //if (sample.hasOwnProperty(attr.SYS_CODE)) {
                    //message += `>- ${attr[attr['SYS_LABEL']]}: ${sample[attr.SYS_CODE]}\n\n`
                    //}
                    //})
                    //if (targetOutput.length > 0){
                    //message += `with the following materials\n\n`
                    //}
                    //}
                    //targetOutput.forEach(target => {
                    //let sample = target['sample']
                    //let workcenter = target['workcenter']
                    ////console.log(target)
                    //if (issueSample){
                    //let scheduledDate = new DatePipe('en-US')
                    //.transform(sample['SYS_DATE_SCHEDULED'], 'MM月dd日')
                    //message += `>- ${scheduledDate}: ${workcenter[workcenter['SYS_LABEL']]}\n\n`
                    //} else {

                    //message += `>- ${workcenter[workcenter['SYS_LABEL']]}: ${sample['SYS_QUANTITY']}\n\n`
                    //}
                    //})
                    //message +=`> \n\n${this.userInfo.name}\n\n` +
                    //`${msg_date}`
                    ////console.log("mmm", message)
                    //let beforeDate = new Date(date)
                    //beforeDate.setDate(date.getDate() + 1) // the day after today in order to include audits today
                    //let beforeDateString = new DatePipe('en-US').transform(beforeDate, 'yyyy.MM.dd')
                    //let afterDateString = new DatePipe('en-US').transform(date, 'yyyy.MM.dd')
                    //let redirectUrl = `${environment.auditUrl}/audit?newdoc.SYS_WORKCENTER_OPERATOR=${this.userInfo.limsid}&dateafter=${afterDateString}&datebefore=${beforeDateString}`
                    //this.utilService.sendNotif(
                    //"actionCard",
                    //message,
                    //redirectUrl
                    //)
                    //.subscribe(() => {
                    //console.log("Sending notification:", redirectUrl)
                    //})
                    //this.router.navigate(['/redirect' + this.router.url])
                })
    }

    buildDingTalkMessage(
        issueSample: boolean,
        selectedSampleList: any[],
        submittedSampleList: any[],
        attributeList: any[],
        targetOutputList: any[],
        workcenter?: any
    ) {

        this.logger.debug("targetOutputList", targetOutputList)
        const MAX_LENGTH_OF_SAMPLELIST = 3

        let VERB = ''
        let WITH = ''
        if (issueSample) {
            VERB = "issued"
            WITH = "workcenters"
        } else {
            VERB = "submitted"
            WITH = "materials"
        }
        let message = ''

        if (submittedSampleList.length > MAX_LENGTH_OF_SAMPLELIST) {
            if (workcenter) {
                message += `# **${workcenter[workcenter['SYS_LABEL']]}**\n\n`
            } else {
                message += `# **${submittedSampleList[0]['TMP_CODE'].split('.')[0]}**\n\n`
            }
            message += `**${submittedSampleList.length}** samples are ${VERB}:\n\n`
            submittedSampleList.forEach((submittedSample, index) => {
                message += `>- ${selectedSampleList[index].SYS_SAMPLE_CODE}\n\n`
            })
        } else {
            submittedSampleList.forEach((submittedSample, index) => {
                message += `# **${selectedSampleList[index].SYS_SAMPLE_CODE}**\n\n${selectedSampleList[index].CONF_GENERAL_PROJECT_PROJECT_CODE} | ${selectedSampleList[index].CONF_GENERAL_PROJECT_PROJECT_MANAGER}\n\n` +
                    `${VERB} as:\n\n`

                attributeList.forEach(attr => {
                    if (submittedSample.hasOwnProperty(attr.SYS_CODE)) {
                        message += `>- ${attr[attr['SYS_LABEL']]}: ${submittedSample[attr.SYS_CODE]}\n\n`
                    }
                })


                message += `${WITH}:\n\n`
                for (let targetOutput of targetOutputList) {


                    this.logger.debug("targetOutput:", targetOutput)
                    if (targetOutput.length == 0) {
                        break
                    }


                    for (let target of targetOutput) {
                        this.logger.debug("target:", target)
                        let sample = target['sample']
                        let workcenter = target['workcenter']

                        // forkJoin returns value arbitrarily
                        if (sample['SYS_SAMPLE_CODE'] == selectedSampleList[index]['SYS_SAMPLE_CODE']) {
                            this.logger.debug("sample:", sample)
                            if (issueSample) {
                                let scheduledDate = new DatePipe('en-US')
                                    .transform(sample['SYS_DATE_SCHEDULED'], 'MM月dd日')
                                message += `>- ${scheduledDate}: ${workcenter[workcenter['SYS_LABEL']]}\n\n`
                            } else {
                                message += `>- ${workcenter[workcenter['SYS_LABEL']]}: ${sample['SYS_QUANTITY']}\n\n`
                            }

                            continue

                        }
                    }
                }
            })
        }

        this.logger.debug("Message", message)
        return message
    }

    sendMessageToDingTalk$(
        issueSample: boolean,
        selectedSampleList: any[],
        submittedSampleList: any[],
        attributeList: any[],
        targetOutputList: any[],
        workcenter?: any
    ) {

        let message = this.buildDingTalkMessage(
            issueSample,
            selectedSampleList,
            submittedSampleList,
            attributeList,
            targetOutputList,
            workcenter
        )
        let date = new Date()
        let msg_date = date.getFullYear() + '-' +
            (date.getMonth() + 1) + '-' +
            date.getDate() + ' ' +
            date.getHours() + ':' +
            date.getMinutes()

        message += `> \n\n${this.userInfo.name}\n\n` +
            `${msg_date}`
        let beforeDate = new Date(date)
        beforeDate.setDate(date.getDate() + 1) // the day after today in order to include audits today
        let beforeDateString = new DatePipe('en-US').transform(beforeDate, 'yyyy.MM.dd')
        let afterDateString = new DatePipe('en-US').transform(date, 'yyyy.MM.dd')
        let redirectUrl = `${environment.auditUrl}/audit?newdoc.SYS_WORKCENTER_OPERATOR=${this.userInfo.limsid}&dateafter=${afterDateString}&datebefore=${beforeDateString}`
        this.logger.info("Sending notification:", redirectUrl)
        return this.utilService.sendNotif(
            "actionCard",
            message,
            redirectUrl)
    }

    sendMessageToDingTalk(issueSample: boolean, sample: any, attributeList: any[], targetOutput: any[]) {

        let date = new Date()
        let msg_date = date.getFullYear() + '-' +
            (date.getMonth() + 1) + '-' +
            date.getDate() + ' ' +
            date.getHours() + ':' +
            date.getMinutes()

        let message = ''
        if (issueSample) {
            message = `# **${sample.SYS_SAMPLE_CODE}**\n\n${sample.CONF_GENERAL_PROJECT_PROJECT_CODE} | ${sample.CONF_GENERAL_PROJECT_PROJECT_MANAGER}\n\n`
            message += `scheduled to the following workcenters\n\n`
        } else {
            message = `# **${sample.SYS_SAMPLE_CODE}**\n\nsubmitted as\n\n`
            attributeList.forEach(attr => {
                if (sample.hasOwnProperty(attr.SYS_CODE)) {
                    message += `>- ${attr[attr['SYS_LABEL']]}: ${sample[attr.SYS_CODE]}\n\n`
                }
            })
            if (targetOutput.length > 0) {
                message += `with the following materials\n\n`
            }
        }
        targetOutput.forEach(target => {
            let sample = target['sample']
            let workcenter = target['workcenter']
            this.logger.debug("target", target)
            if (issueSample) {
                let scheduledDate = new DatePipe('en-US')
                    .transform(sample['SYS_DATE_SCHEDULED'], 'MM月dd日')
                message += `>- ${scheduledDate}: ${workcenter[workcenter['SYS_LABEL']]}\n\n`
            } else {
                if (workcenter) {
                    message += `>- ${workcenter[workcenter['SYS_LABEL']]}: ${sample['SYS_QUANTITY']}\n\n`
                }
            }
        })
        message += `> \n\n${this.userInfo.name}\n\n` +
            `${msg_date}`
        let beforeDate = new Date(date)
        beforeDate.setDate(date.getDate() + 1) // the day after today in order to include audits today
        let beforeDateString = new DatePipe('en-US').transform(beforeDate, 'yyyy.MM.dd')
        let afterDateString = new DatePipe('en-US').transform(date, 'yyyy.MM.dd')
        let redirectUrl = `${environment.auditUrl}/audit?newdoc.SYS_WORKCENTER_OPERATOR=${this.userInfo.limsid}&dateafter=${afterDateString}&datebefore=${beforeDateString}`
        this.logger.info("Sending notification:", redirectUrl)
        return this.utilService.sendNotif(
            "actionCard",
            message,
            redirectUrl
        )
    }

    createObject$(object: any, attributeInfo: any, issueSample: boolean) {

        object['SYS_WORKCENTER_OPERATOR'] = this.userInfo.limsid
        object['SYS_AUDIT_DOCSET'] = this.utilService.getDocSet(
            this.userInfo.limsid,
            object['SYS_SAMPLE_CODE'],
        )

        if (issueSample) {
            return this.entityService.create(object)
                .mergeMap(data => {
                    delete data.SYS_WORKCENTER_OPERATOR
                    delete data.SYS_DATE_COMPLETED
                    this.logger.debug('Issue sample:', data)
                    return this.buildRelationship(data, attributeInfo)
                })
                .retryWhen(
                    attempts => Observable.range(1, 10)
                        .zip(attempts, i => i)
                        .mergeMap(i => {
                            this.logger.info("delay retry by " + i + " seconds")
                            return Observable.timer(i * 1000);
                        }))
        } else {
            let sampleCode = object['SYS_SAMPLE_CODE']
            return this.isSuspended(sampleCode)
                .mergeMap(isSuspended => {
                    this.logger.debug("SUSPEND CHECKING:", isSuspended)
                    if (isSuspended) {
                        return Observable.throw("Sample '" + sampleCode + "' is suspended")
                    } else {
                        return this.entityService.retrieveByIdentifierFull(object['SYS_IDENTIFIER'])
                            .mergeMap(data => {
                                //this.logger.debug("retrive chained sample:", data)
                                object.id = data[0].id
                                object['SYS_DATE_SCHEDULED'] = data[0]['SYS_DATE_SCHEDULED']
                                // Using update instead of create since the identifier /workcenter/17R001
                                // has been assigned to the scheduled sample
                                return this.entityService.update(object)
                                    .mergeMap(data => {
                                        this.logger.debug('Add Entity:', data)
                                        return this.buildRelationship(data, attributeInfo)
                                    })
                            })
                            .retryWhen(
                                attempts => Observable.range(1, 10)
                                    .zip(attempts, i => i)
                                    .mergeMap(i => {
                                        this.logger.info("delay retry by " + i + " seconds")
                                        return Observable.timer(i * 1000);
                                    }))

                    }
                })
        }
    }

    /**
     * buildRelationship is designed for planning in routing or records usage of
     * material in BoM, from sourceEntity to the targetEntity.
     *
     * @param sourceEntity The manipulated entity.
     * @param attributeInfo argument map
     *
     */
    buildRelationship(sourceEntity: any, attributeInfo: any) {

        this.logger.debug("Args", sourceEntity, attributeInfo)
        let observableList = []

        let attributeList = attributeInfo['attributeList']
        let parentMap = attributeInfo['parentMap']

        // Get the keys for each kind of BoM/Routing, e.g., "bom", "bill_of_material".
        Object.keys(parentMap).forEach(key => {

            let targetEntityMap = parentMap[key]
            this.logger.debug("targetEntityMap", targetEntityMap)

            let SYS_DATE_SCHEDULED: Date

            // Get the bom object id, which is used as the key of the actual usage, e.g., <bom object id>
            Object.keys(targetEntityMap)
                .sort((a, b) => {
                    // sort target entities by SYS_ORDER which is manipulated by admins.
                    if (targetEntityMap[a]['SYS_ORDER'] > targetEntityMap[b]['SYS_ORDER']) {
                        return 1
                    } else {
                        return -1
                    }
                })
                .forEach((entityId, index) => {

                    // targetEntityInput is the inputs from user and contains SYS_QUANT, SYS_SOURCE, etc.
                    let targetEntityInput = targetEntityMap[entityId]

                    // only process checked Material or Workcenter
                    if (targetEntityInput['SYS_CHECKED']) {

                        this.logger.debug("targetEntityInput", targetEntityInput)
                        // Calculate SYS_DATE_SCHEDULED

                        SYS_DATE_SCHEDULED = this.getScheduledDate(SYS_DATE_SCHEDULED, sourceEntity['SYS_DATE_SCHEDULED'], targetEntityInput['SYS_DURATION'])
                        targetEntityInput['SYS_DATE_SCHEDULED'] = new Date(SYS_DATE_SCHEDULED)

                        if (index == 0) {
                            targetEntityInput['SYS_DATE_ARRIVED'] = targetEntityInput['SYS_DATE_SCHEDULED']
                        }

                        this.logger.debug("new targetEntityInput", targetEntityInput)
                        // Get the target entity from the SYS_SOURCE
                        observableList.push(
                            this.entityService.retrieveById(targetEntityInput['SYS_SOURCE'])
                                .mergeMap(targetEntity => {
                                    this.logger.debug("targetEntity", targetEntity)

                                    //.subscribe(targetEntity => {

                                    // check whether SYS_SOURCE has been specified manually
                                    // BoM: 'class' == 'collection'
                                    // Routing: 'class' == 'class', since it's only one option and the
                                    // checkbox is another way to detect checked or not
                                    if (targetEntity.SYS_ENTITY_TYPE == targetEntityInput['SYS_FLOOR_ENTITY_TYPE']) {
                                        // SYS_SOURCE has been specified manually

                                        //console.log("---------Entries has been specified:", targetEntity)
                                        this.logger.debug("createSubEntity args", sourceEntity, targetEntity, attributeList, targetEntityInput)
                                        return this.createSubEntity(sourceEntity, targetEntity, attributeList, targetEntityInput)

                                    } else {
                                        // SYS_SORUCE is not selected, and it happens only when BoM
                                        // (checked but not selected)

                                        // Get the LOTs of targetEntity and take the first one as the default
                                        return this.entityService.retrieveEntity(
                                            targetEntityInput['SYS_SOURCE'],
                                            targetEntityInput['SYS_FLOOR_ENTITY_TYPE'])
                                            .mergeMap(data => {
                                                this.logger.debug("targetEntityInput", targetEntityInput)

                                                //.subscribe(data => {
                                                //console.log("---------Retrieve entries in BoM or Routing:", data[0])
                                                //console.log("merge from entity:", targetEntity)
                                                if (!data[0]) {
                                                    this.logger.warn("None of LOT under the " +
                                                        targetEntityInput['SYS_SOURCE'])
                                                } else {
                                                    this.logger.debug("createSubEntity args", sourceEntity, targetEntity, attributeList, targetEntityInput)
                                                    return this.createSubEntity(sourceEntity, data[0], attributeList, targetEntityInput)
                                                }

                                            })

                                    }
                                })
                        )
                    }
                })

        })

        return Observable.concat(...observableList)
        //return Observable.forkJoin(observableList)
    }

    getScheduledDate(
        SYS_DATE_SCHEDULED: Date,
        sourceEntityScheduledDate: Date,
        targetEntityDuration: number,
    ) {
        if (!SYS_DATE_SCHEDULED) {
            if (sourceEntityScheduledDate) {
                SYS_DATE_SCHEDULED = new Date(sourceEntityScheduledDate)
            } else {
                SYS_DATE_SCHEDULED = new Date()
            }
        } else {
            SYS_DATE_SCHEDULED.setDate(
                SYS_DATE_SCHEDULED.getDate() +
                (targetEntityDuration ? targetEntityDuration : 0)
            )
        }
        return SYS_DATE_SCHEDULED

    }

    /**
     * Create subentities for the given entity. For the BoM, it's used to create
     * the droplet(object entity) under the Material, and for the routing, to
     * create the sample(collection entity) under the Workcenter.
     *
     * For the creation of subEntity, Routing copies "attributeList" from the
     * current workcenter(Project Management) to the subEntity for the target
     * workcenter(Sample Extraction for example), e.g., index, panel, routing,
     * etc.; BoM copies "attrbiutes" from the target material to the subEntity
     * for the target Material(Kapa Hifi for example).
     *
     * @param sourceEntity The SYS_SOURCE object under the Project Management.
     * @param targetEntity Material(collection, in BoM) or Workcenter(class, in Routing).
     * @param workcenterAttributeList Attributes of the sub entity of the current workcenter.
     * @param targetEntityInput The BoM/Routing entry generated by entity/form.inline.component.
     * @return nill
     */
    @LogCall
    createSubEntity(
        sourceEntity: any,
        targetEntity: any,
        workcenterAttributeList: any[],
        targetEntityInput: any
    ): Observable<any> {

        let subEntity = {}

        // Get default label from the source entity
        subEntity['SYS_LABEL'] = sourceEntity['SYS_LABEL']
        subEntity[subEntity['SYS_LABEL']] = sourceEntity[sourceEntity['SYS_LABEL']]

        subEntity['SYS_TARGET'] = sourceEntity.id

        // Assign DOCSET
        subEntity['SYS_AUDIT_DOCSET'] = sourceEntity['SYS_AUDIT_DOCSET']

        // The tail timestamp is used to avoid duplicated SYS_IDENTIFIER for the
        // samples involved more than one time in the same workcenter
        subEntity['SYS_IDENTIFIER'] = targetEntity.SYS_IDENTIFIER + "/" +
            sourceEntity['SYS_CODE'] + '.' + new Date().getTime() + '.' +
            Math.random().toString().substr(2, 4)

        this.logger.debug("subEntity", Object.assign({}, subEntity))
        if (targetEntity['SYS_ENTITY_TYPE'] == 'class') {
            // Routing specific operations

            subEntity['SYS_ENTITY_TYPE'] = 'collection'
            workcenterAttributeList.forEach(attribute => {
                if (!this.ignoredAttribute[attribute.SYS_CODE]) {
                    subEntity[attribute['SYS_CODE']] = sourceEntity[attribute['SYS_CODE']]
                }
            })
            this.logger.debug("new subEntity", subEntity)
            return this.submitSubEntity(subEntity, targetEntity, targetEntityInput)

        } else { // == 'collection'
            // BoM specific operations

            subEntity['SYS_ENTITY_TYPE'] = 'object'
            return this.entityService.retrieveAttribute(targetEntity.id)
                .mergeMap(attributes => {
                    attributes.forEach(attribute => {
                        subEntity[attribute.SYS_CODE] = targetEntity[attribute.SYS_CODE]
                    })
                    this.logger.debug("new subEntity", Object.assign({}, subEntity))
                    return this.submitSubEntity(subEntity, targetEntity, targetEntityInput)
                })
        }
    }

    /**
     * submitSubEntity is created only for reusing logics and avoid to introduce
     * async for BoM and Routing
     *
     * The SYS_GENRE should be the default genre of the workcenter/material
     * instead of targetEntity['SYS_GENRE'] which is "/PRODUCT_WORKCENTER/", and
     * sourceEntity['SYS_GENRE'] which is "/PROJECT_MANAGEMENT/GENERAL_PROJECT/"
     *
     */
    @LogCall
    submitSubEntity(subEntity: any, targetEntity: any, targetEntityInput: any): Observable<any> {

        //for both of BoM and Routing
        return this.genreService.retrieveBy({
            "SYS_ENTITY": targetEntity.id
        })
            .mergeMap(data => {
                if (data[0]) {
                    // Get SYS_GENRE from the workcenter

                    subEntity['SYS_GENRE'] = data[0].id
                    this.logger.debug("genre", data)
                } else {
                    // Collection of materials may not contains any SYS_GENRE defaultly

                    subEntity['SYS_GENRE'] = targetEntity['SYS_GENRE']
                    this.logger.debug("genre", subEntity['SYS_GENRE'])
                }

                // Assign new values to the new material object
                Object.keys(targetEntityInput).forEach(key => {
                    subEntity[key] = targetEntityInput[key]
                })

                this.logger.debug("subEntity", subEntity)
                return this.entityService.create(subEntity)
                    //.map(entity => {
                    .mergeMap(entity => {
                        this.logger.debug("result", {'workcenter': targetEntity, 'sample': subEntity})
                        return Observable.of({'workcenter': targetEntity, 'sample': subEntity})
                    })
                //.delay(100)
            })
            .retryWhen(
                attempts => Observable.range(1, 10)
                    .zip(attempts, i => i)
                    .mergeMap(i => {
                        this.logger.info("delay retry by " + i + " seconds")
                        return Observable.timer(i * 1000);
                    }))
    }
    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action)
    }

    showMessage(message: string, action: string) {
        this.snackBar.open(message, action, {duration: 4000})
    }

}

