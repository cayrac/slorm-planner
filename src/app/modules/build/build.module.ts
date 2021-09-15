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
import {
    AncestralLegacyMapComponent,
} from './component/ancestral-legacies/components/ancestral-legacy-map/ancestral-legacy-map.component';
import {
    AncestralLegacySlotComponent,
} from './component/ancestral-legacies/components/ancestral-legacy-slot/ancestral-legacy-slot.component';
import { AttributesComponent } from './component/attributes/attributes.component';
import { AttributeLineComponent } from './component/attributes/components/attribute-line/attribute-line.component';
import { TraitComponent } from './component/attributes/components/trait/trait.component';
import { BuildHeaderComponent } from './component/build-header/build-header.component';
import { ActivableSlotComponent } from './component/inventory/components/activable-slot/activable-slot.component';
import {
    CharacterAnimationComponent,
} from './component/inventory/components/character-animation/character-animation.component';
import { ItemSlotComponent } from './component/inventory/components/item-slot/item-slot.component';
import { ReaperSlotComponent } from './component/inventory/components/reaper-slot/reaper-slot.component';
import { SettingsMenuComponent } from './component/inventory/components/settings-menu/settings-menu.component';
import { SkillBarComponent } from './component/inventory/components/skill-bar/skill-bar.component';
import { SkillSlotComponent } from './component/inventory/components/skill-slot/skill-slot.component';
import { InventoryComponent } from './component/inventory/inventory.component';
import { itemMoveService } from './component/inventory/services/item-move.service';
import { SearchService } from './component/inventory/services/search.service';
import { SettingsSkillsComponent } from './component/skills/components/settings-skills/settings-skills.component';
import { UpgradeSlotComponent } from './component/skills/components/upgrade-slot/upgrade-slot.component';
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
        ActivableSlotComponent,
        SettingsMenuComponent,
        BuildHeaderComponent,
        SettingsSkillsComponent,
        UpgradeSlotComponent,
        AncestralLegacyMapComponent,
        AncestralLegacySlotComponent,
        AttributesComponent,
        AttributeLineComponent,
        TraitComponent
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
        itemMoveService,
        SearchService
    ],
})
export class BuildModule { }
