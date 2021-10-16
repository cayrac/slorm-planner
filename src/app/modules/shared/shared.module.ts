import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ActivableSlotComponent } from './components/activable-slot/activable-slot.component';
import { ActivableViewComponent } from './components/activable-view/activable-view.component';
import { AncestralLegacySlotComponent } from './components/ancestral-legacy-slot/ancestral-legacy-slot.component';
import { AncestralLegacyViewComponent } from './components/ancestral-legacy-view/ancestral-legacy-view.component';
import { AttributeLineComponent } from './components/attribute-line/attribute-line.component';
import { AttributeSummaryViewComponent } from './components/attribute-summary-view/attribute-summary-view.component';
import { CharacterAnimationComponent } from './components/character-animation/character-animation.component';
import { CharacterEquipmentComponent } from './components/character-equipment/character-equipment.component';
import {
    CharacterLevelEditModalComponent,
} from './components/character-level-edit-modal/character-level-edit-modal.component';
import { CompareItemModalComponent } from './components/compare-item-modal/compare-item-modal.component';
import { CompareViewComponent } from './components/compare-view/compare-view.component';
import { ContentBlockedModalComponent } from './components/content-blocked-modal/content-blocked-modal.component';
import { DeleteLayerModalComponent } from './components/delete-layer-modal/delete-layer-modal.component';
import { DeletePlannerModalComponent } from './components/delete-planner-modal/delete-planner-modal.component';
import { EditLayerModalComponent } from './components/edit-layer-modal/edit-layer-modal.component';
import { FileUploadButtonComponent } from './components/file-upload-button/file-upload-button.component';
import { ImportDataComponent } from './components/import-data/import-data.component';
import { ItemBaseChoiceModalComponent } from './components/item-base-choice-modal/item-base-choice-modal.component';
import { ItemEditBuffAttributeComponent } from './components/item-edit-buff-attribute/item-edit-buff-attribute.component';
import { ItemEditBuffReaperComponent } from './components/item-edit-buff-reaper/item-edit-buff-reaper.component';
import { ItemEditBuffSkillComponent } from './components/item-edit-buff-skill/item-edit-buff-skill.component';
import {
    ItemEditLegendaryEffectComponent,
} from './components/item-edit-legendary-effect/item-edit-legendary-effect.component';
import { ItemEditModalComponent } from './components/item-edit-modal/item-edit-modal.component';
import { ItemEditStatComponent } from './components/item-edit-stat/item-edit-stat.component';
import {
    ItemReinforcmentEditModalComponent,
} from './components/item-reinforcment-edit-modal/item-reinforcment-edit-modal.component';
import { ItemSlotComponent } from './components/item-slot/item-slot.component';
import { ItemViewComponent } from './components/item-view/item-view.component';
import { MainStatsComponent } from './components/main-stats/main-stats.component';
import { MechanicsViewComponent } from './components/mechanics-view/mechanics-view.component';
import { ReaperEditModalComponent } from './components/reaper-edit-modal/reaper-edit-modal.component';
import { ReaperSlotComponent } from './components/reaper-slot/reaper-slot.component';
import { ReaperViewComponent } from './components/reaper-view/reaper-view.component';
import { RemoveConfirmModalComponent } from './components/remove-confirm-modal/remove-confirm-modal.component';
import { ReplacePlannerModalComponent } from './components/replace-planner-modal/replace-planner-modal.component';
import { SettingsMenuComponent } from './components/settings-menu/settings-menu.component';
import { SkillBarComponent } from './components/skill-bar/skill-bar.component';
import { SkillSlotComponent } from './components/skill-slot/skill-slot.component';
import { SkillUpgradeViewComponent } from './components/skill-upgrade-view/skill-upgrade-view.component';
import { SkillViewComponent } from './components/skill-view/skill-view.component';
import { SnackbarComponent } from './components/snackbar/snackbar.component';
import { TraitViewComponent } from './components/trait-view/trait-view.component';
import { TraitComponent } from './components/trait/trait.component';
import { UpgradeSlotComponent } from './components/upgrade-slot/upgrade-slot.component';
import { MaterialModule } from './material.module';


@NgModule({
    declarations: [
        SnackbarComponent,
        EditLayerModalComponent,
        DeleteLayerModalComponent,
        ItemViewComponent,
        ReaperViewComponent,
        ActivableViewComponent,
        SkillViewComponent,
        SkillUpgradeViewComponent,
        AncestralLegacyViewComponent,
        TraitViewComponent,
        AttributeSummaryViewComponent,
        ItemEditModalComponent,
        ItemEditStatComponent,
        ItemEditLegendaryEffectComponent,
        ItemEditBuffReaperComponent,
        ItemEditBuffSkillComponent,
        ItemEditBuffAttributeComponent,
        ItemBaseChoiceModalComponent,
        RemoveConfirmModalComponent,
        ReaperEditModalComponent,
        CharacterLevelEditModalComponent,
        ReplacePlannerModalComponent,
        ItemSlotComponent,
        CharacterAnimationComponent,
        ReaperSlotComponent,
        SkillSlotComponent,
        ActivableSlotComponent,
        SkillBarComponent,
        SettingsMenuComponent,
        CharacterEquipmentComponent,
        UpgradeSlotComponent,
        AncestralLegacySlotComponent,
        AttributeLineComponent,
        TraitComponent,
        MainStatsComponent,
        DeletePlannerModalComponent,
        ImportDataComponent,
        FileUploadButtonComponent,
        ContentBlockedModalComponent,
        CompareItemModalComponent,
        CompareViewComponent,
        ItemReinforcmentEditModalComponent,
        MechanicsViewComponent,
    ],
    imports: [
        CommonModule,
        MaterialModule,
        ReactiveFormsModule
    ],
    exports: [
        MaterialModule,
        ReactiveFormsModule,
        ItemViewComponent,
        ReaperViewComponent,
        ActivableViewComponent,
        SkillViewComponent,
        SkillUpgradeViewComponent,
        AncestralLegacyViewComponent,
        TraitViewComponent,
        AttributeSummaryViewComponent,
        ItemEditModalComponent,
        ItemEditStatComponent,
        ItemEditLegendaryEffectComponent,
        ItemEditBuffReaperComponent,
        ItemEditBuffSkillComponent,
        ItemEditBuffAttributeComponent,
        ItemBaseChoiceModalComponent,
        RemoveConfirmModalComponent,
        ReaperEditModalComponent,
        CharacterLevelEditModalComponent,
        ReplacePlannerModalComponent,
        DeletePlannerModalComponent,
        ItemSlotComponent,
        CharacterAnimationComponent,
        ReaperSlotComponent,
        ActivableSlotComponent,
        SkillSlotComponent,
        SkillBarComponent,
        SettingsMenuComponent,
        CharacterEquipmentComponent,
        UpgradeSlotComponent,
        AncestralLegacySlotComponent,
        AttributeLineComponent,
        TraitComponent,
        MainStatsComponent,
        ImportDataComponent,
        FileUploadButtonComponent,
        ContentBlockedModalComponent,
        CompareItemModalComponent,
        CompareViewComponent,
        ItemReinforcmentEditModalComponent,
        MechanicsViewComponent,
    ],
    providers: [
    ],
})
export class SharedModule { }
