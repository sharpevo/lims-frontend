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

import {ViewComponent} from './entity/view.component';
import {TreeViewComponent} from './tree/component';

import {NewEntityDialog} from './entity/create.dialog.component';
import {NewAttributeDialog} from './attribute/form.dialog.component';

@NgModule({
  declarations: [
    ObjectKeysPipe,

    AppComponent,
    ViewComponent,

    TreeViewComponent,
    NewEntityDialog,
    NewAttributeDialog,
  ],
  entryComponents:[
    NewEntityDialog,
    NewAttributeDialog,
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
