import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { ListComponent } from './components/list/list.component';
import { ReaperListComponent } from './components/reaper-list/reaper-list.component';
import { ReaperSidenavComponent } from './components/reaper-sidenav/reaper-sidenav.component';
import { SlormReaperRoutingModule } from './slorm-reaper-routing.module';


@NgModule({
    declarations: [
        ReaperListComponent,
        ListComponent,
        ReaperSidenavComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        SlormReaperRoutingModule
    ]
})
export class SlormReaperModule { }
