import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../shared/material.module';
import { SharedModule } from '../shared/shared.module';
import { SlormancerModule } from '../slormancer';
import { BuildRoutingModule } from './build-routing.module';
import { BuildComponent } from './build.component';
import { AncestralLegaciesComponent } from './component/ancestral-legacies/ancestral-legacies.component';
import { InventoryComponent } from './component/inventory/inventory.component';
import { SkillsComponent } from './component/skills/skills.component';


@NgModule({
  declarations: [
    SkillsComponent,
    AncestralLegaciesComponent,
    InventoryComponent,
    BuildComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    BuildRoutingModule,
    FormsModule,
    SlormancerModule,
    MaterialModule,
    HttpClientModule, // TODO besoin uniquement pour charger rapidement la save, à virer ensuite
  ],
  providers: [],
})
export class BuildModule { }
