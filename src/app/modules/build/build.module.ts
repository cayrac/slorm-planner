import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../shared/material.module';
import { SharedModule } from '../shared/shared.module';
import { BuildRoutingModule } from './build-routing.module';
import { BuildComponent } from './build.component';
import { AncestralLegaciesComponent } from './component/ancestral-legacies/ancestral-legacies.component';
import {
    AncestralLegacyMapComponent,
} from './component/ancestral-legacies/components/ancestral-legacy-map/ancestral-legacy-map.component';
import { AttributesComponent } from './component/attributes/attributes.component';
import { BuildHeaderComponent } from './component/build-header/build-header.component';
import { InventoryComponent } from './component/inventory/inventory.component';
import { SidenavComponent } from './component/sidenav/sidenav.component';
import { SettingsSkillsComponent } from './component/skills/components/settings-skills/settings-skills.component';
import { SkillsComponent } from './component/skills/skills.component';
import { StatsComponent } from './component/stats/stats.component';


@NgModule({
    declarations: [
        SkillsComponent,
        AncestralLegaciesComponent,
        InventoryComponent,
        BuildComponent,
        BuildHeaderComponent,
        SettingsSkillsComponent,
        AncestralLegacyMapComponent,
        AttributesComponent,
        SidenavComponent,
        StatsComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        BuildRoutingModule,
        FormsModule,
        MaterialModule,
    ]
})
export class BuildModule { }
