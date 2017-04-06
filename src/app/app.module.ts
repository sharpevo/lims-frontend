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

import {EntityFormInlineComponent} from './entity/form.inline.component';
import {EntityFormBomComponent} from './entity/form.bom.component';
import {EntityOptionListComponent} from './entity/form.list.component';
import {ViewComponent} from './entity/view.component';
import {TreeViewComponent} from './tree/component';

import {GenreFormDialog} from './genre/form.dialog.component';
import {EntityFormDialog} from './entity/form.dialog.component';
import {AttributeFormDialog} from './attribute/form.dialog.component';

@NgModule({
  declarations: [
    ObjectKeysPipe,

    AppComponent,
    ViewComponent,
    EntityFormInlineComponent,
    EntityOptionListComponent,
    EntityFormBomComponent,

    TreeViewComponent,
    GenreFormDialog,
    EntityFormDialog,
    AttributeFormDialog,
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
