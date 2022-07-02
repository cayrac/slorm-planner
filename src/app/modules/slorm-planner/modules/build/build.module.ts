import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { BuildRoutingModule } from './build-routing.module';
import { BuildComponent } from './build.component';
import { AncestralLegaciesComponent } from './component/ancestral-legacies/ancestral-legacies.component';
import {
    AncestralLegacyMapComponent,
} from './component/ancestral-legacies/components/ancestral-legacy-map/ancestral-legacy-map.component';
import { AttributesComponent } from './component/attributes/attributes.component';
import { BuildHeaderComponent } from './component/build-header/build-header.component';
import { BuildSidenavComponent } from './component/build-sidenav/build-sidenav.component';
import { CalcsComponent } from './component/calcs/calcs.component';
import { DefenseCalcComponent } from './component/calcs/components/defense-calc/defense-calc.component';
import {
    TurretSyndromeCalcComponent,
} from './component/calcs/components/turret-syndrome-calc/turret-syndrome-calc.component';
import { CompareComponent } from './component/compare/compare.component';
import { ConfigEntryComponent } from './component/config/components/config-entry/config-entry.component';
import { ConfigComponent } from './component/config/config.component';
import { InventoryComponent } from './component/inventory/inventory.component';
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
        BuildSidenavComponent,
        StatsComponent,
        ConfigComponent,
        ConfigEntryComponent,
        CompareComponent,
        CalcsComponent,
        DefenseCalcComponent,
        TurretSyndromeCalcComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        BuildRoutingModule,
    ]
})
export class BuildModule { }
