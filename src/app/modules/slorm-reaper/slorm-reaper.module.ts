import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { ListComponent } from './components/list/list.component';
import { SlormReaperRoutingModule } from './slorm-reaper-routing.module';


@NgModule({
    declarations: [
        ListComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        SlormReaperRoutingModule
    ]
})
export class SlormReaperModule { }
