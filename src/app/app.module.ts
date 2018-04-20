import {BrowserModule} from '@angular/platform-browser';
import {NgModule, APP_INITIALIZER, Injector} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {routingModule} from './app.routes'
import {FlexLayoutModule} from '@angular/flex-layout';
//
// Materilas
//
import {MaterialModule} from './material.module'
import {MatSnackBarModule} from '@angular/material/snack-bar';
//
// Apps
//
import {AppComponent} from './app.component';

import {ObjectKeysPipe} from './objectKeys.pipe'

import {EntityService} from './entity/service';
import {GenreService} from './genre/service';
import {AttributeService} from './attribute/service';
import {UtilService} from './util/service';

import {EntityCollectionExpansionComponent} from './entity/collection.expansion.component';
import {EntityFormInlineComponent} from './entity/form.inline.component';
import {EntitySelectListComponent} from './entity/select.list.component';
import {EntityToStringComponent} from './entity/tostring.component';
import {ViewComponent} from './entity/view.component';
import {TreeViewComponent} from './tree/component';
import {WorkcenterOverviewComponent} from './workcenter/overview.component';
import {EntityInfoInlineComponent} from './entity/info.inline.component';
import {WorkcenterDashboardComponent} from './workcenter/dashboard.component';
import {WorkcenterSampleScheduledComponent} from './workcenter/sample.scheduled.component';
import {WorkcenterSampleActivatedComponent} from './workcenter/sample.activated.component';
import {WorkcenterSampleCompletedComponent} from './workcenter/sample.completed.component';
import {WorkcenterSampleTerminatedComponent} from './workcenter/sample.terminated.component';
import {WorkcenterSampleDispatchedComponent} from './workcenter/sample.dispatched.component';
import {SampleFormDialog} from './workcenter/form.dialog.component';
import {HybridSampleDestructorComponent} from './workcenter/hybrid.sample.destructor.component';

import {ProjectManagementComponent} from './workcenter/project.management.component';

import {GenreFormDialog} from './genre/form.dialog.component';
import {EntityFormDialog} from './entity/form.dialog.component';
import {AttributeFormDialog} from './attribute/form.dialog.component';

import {SampleService} from './models/sample';

import {SampleHistoryComponent} from './sample/history.component'

import {ChartsModule} from 'ng2-charts';
import {PluginIndexIndicatorComponent} from './plugins/index.indicator'
import {PluginIndexValidatorComponent} from './plugins/index.validator'
import {PluginPanelIndicatorComponent} from './plugins/panel.indicator'
import {PluginExcelProcessorComponent} from './plugins/excel.processor'

import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import 'hammerjs'

import {CdkTableModule} from '@angular/cdk/table';

import {TablifyComponent} from './util/tablify.component'

import {SimpleTableDialog} from './util/simple.table.dialog';
import {AuxiliaryAttributeComponent} from './util/auxiliary.attribute.component';
import {ShowAuxiliaryAttributeDialog} from './util/auxiliary.attribute.dialog';
import {AppsComponent} from './apps/component';

import {SpinnerService} from './util/spinner.service';
import {SpinnerComponent} from './util/spinner.component';

import {CustomHttpService, customHttpFactory} from './util/custom.http.service'
import {XHRBackend, RequestOptions} from '@angular/http';
import {AuthService} from './util/auth.service'


import {RedirectComponent} from './util/redirect.component'
import {EditPMSampleDialog} from './workcenter/project.management.edit.dialog'
import {SuspendSampleDialog} from './workcenter/project.management.suspend.dialog'
import {MaterialOverviewComponent} from './material/overview.component'
import {SampleOverviewComponent} from './sample/overview.component'
import {KPIComponent} from './statistics/kpi.component'
import {AppLoadModule} from './app.load.module'
import {UserInfoService} from './util/user.info.service'
import {GuardService} from './util/guard.service'

import {LogService} from './log/log.service'
import {LogPublisher} from './log/publisher'
import {LogPublisherService} from './log/publisher.service'

import {InjectorContainerModule} from './injector.module'

import {ExcelService} from './util/excel.service'
import {SampleDispatchedFormComponent} from './workcenter/sample.dispatched.form.component'

@NgModule({
    declarations: [
        ObjectKeysPipe,

        AppComponent,
        ViewComponent,
        EntityCollectionExpansionComponent,
        EntitySelectListComponent,
        EntityFormInlineComponent,
        EntityToStringComponent,

        TreeViewComponent,
        GenreFormDialog,
        EntityFormDialog,
        AttributeFormDialog,

        WorkcenterOverviewComponent,
        EntityInfoInlineComponent,
        WorkcenterDashboardComponent,
        WorkcenterSampleScheduledComponent,
        WorkcenterSampleActivatedComponent,
        WorkcenterSampleCompletedComponent,
        WorkcenterSampleTerminatedComponent,
        WorkcenterSampleDispatchedComponent,
        SampleFormDialog,
        ProjectManagementComponent,

        HybridSampleDestructorComponent,

        SampleHistoryComponent,
        PluginIndexIndicatorComponent,
        PluginIndexValidatorComponent,
        PluginPanelIndicatorComponent,
        PluginExcelProcessorComponent,
        TablifyComponent,
        SimpleTableDialog,
        AuxiliaryAttributeComponent,
        ShowAuxiliaryAttributeDialog,
        AppsComponent,
        SpinnerComponent,
        RedirectComponent,
        EditPMSampleDialog,
        SuspendSampleDialog,
        MaterialOverviewComponent,
        SampleOverviewComponent,
        KPIComponent,
        SampleDispatchedFormComponent,
    ],
    entryComponents: [
        GenreFormDialog,
        EntityFormDialog,
        AttributeFormDialog,
        SampleFormDialog,
        SimpleTableDialog,
        ShowAuxiliaryAttributeDialog,
        EditPMSampleDialog,
        SuspendSampleDialog,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        FlexLayoutModule,
        routingModule,
        ChartsModule,

        BrowserAnimationsModule,
        CdkTableModule,
        AppLoadModule,

        MaterialModule,
        InjectorContainerModule,
    ],
    providers: [
        //AppLoadService,
        //{
        //provide: APP_INITIALIZER,
        //useFactory: init_app,
        //deps: [
        //AppLoadService,
        //UtilService,
        //AuthService,
        //],
        //multi: true
        //},
        EntityService,
        GenreService,
        AttributeService,
        SampleService,
        UtilService,
        SpinnerService,
        AuthService,
        GuardService,
        {
            provide: CustomHttpService,
            useFactory: customHttpFactory,
            deps: [
                XHRBackend,
                RequestOptions,
                MatSnackBarModule,
                SpinnerService,
                UserInfoService,
            ]
        },
        UserInfoService,
        LogService,
        LogPublisherService,
        ExcelService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
