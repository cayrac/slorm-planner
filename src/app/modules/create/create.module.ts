import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../shared/material.module';
import { SharedModule } from '../shared/shared.module';
import { CreateBuildFromGameComponent } from './component/create-build-from-game/create-build-from-game.component';
import { CreateBuildComponent } from './component/create-build/create-build.component';
import { CreateRoutingModule } from './create-routing.module';
import { CreateComponent } from './create.component';


@NgModule({
    declarations: [
        CreateComponent,
        CreateBuildComponent,
        CreateBuildFromGameComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        CreateRoutingModule,
        OverlayModule,
        FormsModule,
        MaterialModule,
    ],
    providers: [
    ],
})
export class CreateModule { }
