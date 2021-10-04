import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../shared/material.module';
import { SharedModule } from '../shared/shared.module';
import { SlormancerModule } from '../slormancer';
import { ViewCharacterComponent } from './component/view-character/view-character.component';
import { ViewRoutingModule } from './view-routing.module';
import { ViewComponent } from './view.component';


@NgModule({
    declarations: [
        ViewComponent,
        ViewCharacterComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        ViewRoutingModule,
        OverlayModule,
        FormsModule,
        SlormancerModule,
        MaterialModule,
        HttpClientModule,
    ],
    providers: [
    ],
})
export class ViewModule { }
