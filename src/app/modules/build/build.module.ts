import { OverlayModule } from '@angular/cdk/overlay';
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
import { ActivableSlotComponent } from './component/inventory/components/activable-slot/activable-slot.component';
import {
    CharacterAnimationComponent,
} from './component/inventory/components/character-animation/character-animation.component';
import { ItemSlotComponent } from './component/inventory/components/item-slot/item-slot.component';
import { ReaperSlotComponent } from './component/inventory/components/reaper-slot/reaper-slot.component';
import { SkillBarComponent } from './component/inventory/components/skill-bar/skill-bar.component';
import { SkillSlotComponent } from './component/inventory/components/skill-slot/skill-slot.component';
import { InventoryComponent } from './component/inventory/inventory.component';
import { ItemDragService } from './component/inventory/services/item-drag.service';
import { SkillsComponent } from './component/skills/skills.component';


@NgModule({
    declarations: [
        SkillsComponent,
        AncestralLegaciesComponent,
        InventoryComponent,
        BuildComponent,
        ItemSlotComponent,
        CharacterAnimationComponent,
        ReaperSlotComponent,
        SkillSlotComponent,
        SkillBarComponent,
        ActivableSlotComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        BuildRoutingModule,
        OverlayModule,
        FormsModule,
        SlormancerModule,
        MaterialModule,
        HttpClientModule, // TODO besoin uniquement pour charger rapidement la save, à virer ensuite
    ],
    providers: [
        ItemDragService 
    ],
})
export class BuildModule { }
