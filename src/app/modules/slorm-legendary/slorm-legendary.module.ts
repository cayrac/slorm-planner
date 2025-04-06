import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { LegendaryListComponent } from './components/legendary-list/legendary-list.component';
import { LegendarySidenavComponent } from './components/legendary-sidenav/legendary-sidenav.component';
import { ListComponent } from './components/list/list.component';
import { SlormLegendaryRoutingModule } from './slorm-legendary-routing.module';


@NgModule({
    declarations: [
        LegendaryListComponent,
        ListComponent,
        LegendarySidenavComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        SlormLegendaryRoutingModule
    ]
})
export class SlormLegendaryModule { }
