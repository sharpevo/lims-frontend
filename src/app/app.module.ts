import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import {routingModule} from './app.routes'
import {MaterialModule} from '@angular/material'
import { FlexLayoutModule } from '@angular/flex-layout/flexbox';

import { AppComponent } from './app.component';

import {ObjectKeysPipe} from './objectKeys.pipe'

import {EntityService} from './entity/service';
import {GenreService} from './genre/service';
import {AttributeService} from './attribute/service';

import {EntityCollectionExpansionComponent} from './entity/collection.expansion.component';
import {EntityFormInlineComponent} from './entity/form.inline.component';
import {EntitySelectListComponent} from './entity/select.list.component';
import {EntityToStringComponent} from './entity/tostring.component';
import {ViewComponent} from './entity/view.component';
import {TreeViewComponent} from './tree/component';
import {WorkcenterOverviewComponent} from './workcenter/overview.component';
import {EntityInfoInlineComponent} from './entity/info.inline.component';
import {WorkcenterDashboardComponent} from './workcenter/dashboard.component';
import {WorkcenterSampleCandidateComponent} from './workcenter/sample.candidate.component';
import {WorkcenterSampleScheduledComponent} from './workcenter/sample.scheduled.component';
import {WorkcenterSampleActivatedComponent} from './workcenter/sample.activated.component';
import {WorkcenterSampleCompletedComponent} from './workcenter/sample.completed.component';

import {GenreFormDialog} from './genre/form.dialog.component';
import {EntityFormDialog} from './entity/form.dialog.component';
import {AttributeFormDialog} from './attribute/form.dialog.component';

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
    WorkcenterSampleCandidateComponent,
    WorkcenterSampleScheduledComponent,
    WorkcenterSampleActivatedComponent,
    WorkcenterSampleCompletedComponent,
  ],
  entryComponents:[
    GenreFormDialog,
    EntityFormDialog,
    AttributeFormDialog,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    FlexLayoutModule,
    MaterialModule.forRoot(),
    routingModule,

  ],
  providers: [
    EntityService,
    GenreService,
    AttributeService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
