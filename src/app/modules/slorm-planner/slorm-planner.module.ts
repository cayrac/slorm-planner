import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { BuildModule } from './modules/build/build.module';
import { CreateModule } from './modules/create/create.module';
import { ViewModule } from './modules/view/view.module';
import { SlormPlannerRoutingModule } from './slorm-planner-routing.module';


@NgModule({
    declarations: [
    ],
    imports: [
        CommonModule,
        SharedModule,
        SlormPlannerRoutingModule,
        BuildModule,
        ViewModule,
        CreateModule
    ]
})
export class SlormPlannerModule { }
