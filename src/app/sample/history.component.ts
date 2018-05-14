import {Component, Input} from '@angular/core'
import {EntityService} from '../entity/service'
import {MatDialog, MatDialogRef} from '@angular/material'
import {SampleFormDialog} from '../workcenter/form.dialog.component'

@Component({
    selector: 'sample-history',
    templateUrl: './history.component.html',
})

export class SampleHistoryComponent {
    @Input() sample: any
    @Input() selectedSampleList: any[]
    sampleMap: any = {}
    workcenterList: any[] = []

    entity: any = {}

    sampleList: any[] = []

    public lineChartData: any[] = []
    public lineChartLabels: Array<any> = []
    public lineChartItemList: any[] = []
    public lineChartOptionList: any[] = []

    public lineChartLegend: boolean = true;
    public lineChartType: string = 'line';
    public colors: any = {
        'blue': '38,139,210',
        'green': '42,161,152',
        'grey': '148,159,177',
        'greylight': '220,220,220',
        'greydark': '77,83,96',
    }
    public lineChartColors: any = {
        'blue': {
            backgroundColor: 'rgba(' + this.colors.blue + ',0.2)',
            borderColor: 'rgba(' + this.colors.blue + ',1)',
            pointBackgroundColor: 'rgba(' + this.colors.blue + ',1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(' + this.colors.blue + ',0.8)'
        },
        'green': {
            backgroundColor: 'rgba(' + this.colors.green + ',0.2)',
            borderColor: 'rgba(' + this.colors.green + ',1)',
            pointBackgroundColor: 'rgba(' + this.colors.green + ',1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(' + this.colors.green + ',0.8)'
        },
        'grey': {
            backgroundColor: 'rgba(' + this.colors.greylight + ',0.2)',
            borderColor: 'rgba(' + this.colors.greylight + ',1)',
            pointBackgroundColor: 'rgba(' + this.colors.greylight + ',1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(' + this.colors.greylight + ',0.8)'
        },
        'greydark': {
            backgroundColor: 'rgba(' + this.colors.greydark + ',0.2)',
            borderColor: 'rgba(' + this.colors.greydark + ',1)',
            pointBackgroundColor: 'rgba(' + this.colors.greydark + ',1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(' + this.colors.greydark + ',1)'
        }

    }

    constructor(
        public dialog: MatDialog,
        private entityService: EntityService
    ) {}

    ngOnInit() {
        this.getWorkcenterList()
        this.entityService.retrieveByIdentifierFull(
            "/PROJECT_MANAGEMENT/GENERAL_PROJECT")
            .subscribe(data => {
                this.entity = data[0]

            })

    }

    getWorkcenterList() {
        this.entityService.retrieveBySortBy(
            {
                "where": '{"SYS_IDENTIFIER": {"regex":"^/PRODUCT_WORKCENTER"},"SYS_ENTITY_TYPE": {"=":"class"}}',
            },
            "SYS_ORDER")
            .subscribe(data => {
                this.workcenterList = data
                this.getSampleMap()
            })
    }

    getWorkcenterLabelByIdentifier(identifier: string) {
        let workcenter = this.workcenterList.find(workcenter => identifier.indexOf(workcenter['SYS_IDENTIFIER']) >= 0)
        if (workcenter) {
            return workcenter[workcenter['SYS_LABEL']]
        } else {
            return 'unknown'
        }
    }

    getChartOptions(chartItem) {
        let options = {
            showAllTooltips: true,
            labelFontColor: "#666",
            scaleFontColor: "green",
            responsive: true,
            hover: {
                mode: "nearest",
                intersec: true,
            },
            interaction: {
                mode: "nearest",
            },
            scales: {
                yAxes: [
                    {
                        id: 'y-axis-1',
                        display: true,
                        position: 'left',
                        ticks: {
                            beginAtZero: false,
                            stepSize: 1,
                            callback: (label, index, labels) => {
                                return this.sample['SYS_SAMPLE_CODE'] + '-' + label
                            }
                        },
                    }
                ],
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    ticks: {
                        autoSkip: false,
                        callback: (label, index, labels) => {
                            return chartItem['labels'][label - 1]
                            //return this.lineChartLabels[label - 1]
                        }
                    }
                }]
            },
            tooltips: {
                custom: function(tooltip) {
                    if (!tooltip) return
                    tooltip.displayColors = false
                },
                callbacks: {
                    title: function(tooltipItem, data) {
                        return
                    },
                    label: function(tooltipItem, data) {
                        let sample = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].sample
                        let terminatedDate = sample.hasOwnProperty('SYS_DATE_TERMINATED') ? new Date(sample.SYS_DATE_TERMINATED).toDateString() : '-'
                        let completedDate = sample.hasOwnProperty('SYS_DATE_COMPLETED') ? new Date(sample.SYS_DATE_COMPLETED).toDateString() : '-'
                        let tipList = []
                        tipList.push(data.labels[tooltipItem.xLabel - 1])
                        tipList.push(`id: ${sample.id}`)
                        if (completedDate != '-') {
                            tipList.push(`completed: ${completedDate}`)
                        }
                        if (terminatedDate != '-') {
                            tipList.push(`terminated: ${terminatedDate}`)
                        }
                        return tipList
                    }
                }
            },
            animation: {
                duration: 1,
                onComplete: function() {
                    var chartInstance = this.chart,
                        ctx = chartInstance.ctx;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillStyle = '#aaa';

                    this.data.datasets.forEach(function(dataset, i) {
                        var meta = chartInstance.controller.getDatasetMeta(i);
                        meta.data.forEach(function(bar, index) {
                            var data = dataset.data[index]
                            ctx.fillText(data.scheduledDate, bar._model.x, bar._model.y - 5);
                        });
                    });
                }
            }
        };
        return options
    }

    getSampleMap() {
        this.entityService.retrieveBySortBy(
            {'SYS_SAMPLE_CODE': this.sample['SYS_SAMPLE_CODE'], 'SYS_ENTITY_TYPE': 'collection'},
            //"createdAt")
            "SYS_DATE_SCHEDULED")
            .subscribe(data => {

                data.forEach(sample => {

                    // only minions without the master
                    if (sample['SYS_TARGET']) {
                        if (!this.sampleMap[sample['SYS_TARGET']]) {
                            this.sampleMap[sample['SYS_TARGET']] = {}
                            this.sampleMap[sample['SYS_TARGET']]['samples'] = []
                            this.sampleMap[sample['SYS_TARGET']]['labels'] = []
                        }

                        //console.log("#", sample.SYS_IDENTIFIER, sample.SYS_TARGET)
                        this.sampleMap[sample['SYS_TARGET']]['samples'].push(sample)
                        this.sampleMap[sample['SYS_TARGET']]['labels'].push(this.getWorkcenterLabelByIdentifier(sample.SYS_IDENTIFIER))
                        //this.lineChartLabels.push(this.getWorkcenterLabelByIdentifier(sample.SYS_IDENTIFIER))
                    }

                })

                console.log("SM", this.sampleMap, this.lineChartLabels)
                let i = 0
                Object.keys(this.sampleMap).sort().forEach(key => {
                    let sampleList = this.sampleMap[key]['samples']
                    let labelList = this.sampleMap[key]['labels']
                    let chartItem = {}
                    chartItem['data'] = []
                    chartItem['labels'] = this.sampleMap[key]['labels']
                    i += 1
                    let dataSetLabel = this.sampleMap[key]['samples'][0][this.sampleMap[key]['samples'][0]['SYS_LABEL']] + '-' + i
                    let chartData = {
                        data: [],
                        fill: false,
                        pointRadius: [],
                        pointHoverRadius: 10,
                        label: dataSetLabel,
                        pointStyle: [],
                        pointBackgroundColor: [],
                    }

                    let j = 0
                    sampleList.forEach(sample => {
                        let scheduledDate = new Date(sample['SYS_DATE_SCHEDULED'])
                        chartData.data.push({
                            x: j + 1,
                            y: i,
                            sample: sample,
                            sampleId: sample['id'],
                            //scheduledDate: scheduledDate.getFullYear() + '-' + scheduledDate.getMonth() + '-' + scheduledDate.getDate(),
                            scheduledDate: (scheduledDate.getMonth() + 1) + '月' + scheduledDate.getDate() + '日',
                        })

                        let style = ''
                        let radius = 0
                        let background = ''
                        // completed samples
                        if (!sample['SYS_DATE_TERMINATED'] && sample['SYS_DATE_COMPLETED']) {
                            style = 'rect'
                            radius = 8
                            background = 'green'
                        }
                        // next available samples
                        if (!sample['SYS_DATE_TERMINATED'] && !sample['SYS_DATE_COMPLETED']) {
                            style = 'rectRot'
                            radius = 10
                            background = 'blue'
                        }
                        // terminated samples
                        if (sample['SYS_DATE_TERMINATED']) {
                            style = 'triangle'
                            radius = 8
                            background = 'grey'
                        }
                        chartData.pointStyle.push(style)
                        chartData.pointRadius.push(radius)
                        chartData.pointBackgroundColor.push(this.lineChartColors[background].pointBackgroundColor)
                        j += 1
                    })
                    chartItem['colors'] = [
                        {
                            borderColor: this.lineChartColors['blue'].borderColor
                        }
                    ]
                    chartItem['data'].push(chartData)
                    //this.lineChartData.push(chartData)

                    chartItem['options'] = this.getChartOptions(chartItem)
                    this.lineChartItemList.push(chartItem)
                })

                console.log("chart", this.lineChartItemList)


            })

    }

    // what a pity solution
    getSampleKeys() {
        return Object.keys(this.sampleMap)
    }

    public chartClicked(eventObject: any) {
        if (eventObject.active.length > 0) {
            let datasetIndex = eventObject.active[0]._datasetIndex
            let sampleIndex = eventObject.active[0]._index
            let sample = this.lineChartData[datasetIndex].data[sampleIndex].sample
            this.openNewEntityDialog(sample)
        }
    }

    public chartHovered(e: any): void {
        console.log(e);
    }

    openNewEntityDialog(sample: any) {
        let dialogRef = this.dialog.open(SampleFormDialog, {height: '850px', width: '600px'});
        dialogRef.componentInstance.config.entity = this.entity
        dialogRef.componentInstance.config.issueSample = true
        dialogRef.componentInstance.config.sampleList = [sample]
        dialogRef.afterClosed().subscribe(result => {
            this.sampleMap = {}
            this.lineChartData = []
            this.getSampleMap()
        });
    }
}
