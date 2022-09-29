import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

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
import { CharacterSettingsMenuComponent } from './components/character-settings-menu/character-settings-menu.component';
import { CompareItemModalComponent } from './components/compare-item-modal/compare-item-modal.component';
import { CompareViewComponent } from './components/compare-view/compare-view.component';
import { CreateBuildEmptyComponent } from './components/create-build-empty/create-build-empty.component';
import { CreateBuildFromExportComponent } from './components/create-build-from-export/create-build-from-export.component';
import { CreateBuildFromGameComponent } from './components/create-build-from-game/create-build-from-game.component';
import { CreateBuildModalComponent } from './components/create-build-modal/create-build-modal.component';
import { CreateBuildComponent } from './components/create-build/create-build.component';
import { DeleteBuildModalComponent } from './components/delete-build-modal/delete-build-modal.component';
import { DeleteLayerModalComponent } from './components/delete-layer-modal/delete-layer-modal.component';
import { EditBuildModalComponent } from './components/edit-build-modal/edit-build-modal.component';
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
import { MergedStatViewComponent } from './components/merged-stat-view/merged-stat-view.component';
import {
    OptimizeItemsAffixesModalComponent,
} from './components/optimize-items-affixes-modal/optimize-items-affixes-modal.component';
import { ReaperEditModalComponent } from './components/reaper-edit-modal/reaper-edit-modal.component';
import { ReaperSlotComponent } from './components/reaper-slot/reaper-slot.component';
import { ReaperViewComponent } from './components/reaper-view/reaper-view.component';
import { RemoveConfirmModalComponent } from './components/remove-confirm-modal/remove-confirm-modal.component';
import { RuneSlotComponent } from './components/rune-slot/rune-slot.component';
import { RuneViewComponent } from './components/rune-view/rune-view.component';
import { RunesSlotComponent } from './components/runes-slot/runes-slot.component';
import { SearchSelectComponent } from './components/search-select/search-select.component';
import { SkillBarComponent } from './components/skill-bar/skill-bar.component';
import { SkillSlotComponent } from './components/skill-slot/skill-slot.component';
import { SkillUpgradeViewComponent } from './components/skill-upgrade-view/skill-upgrade-view.component';
import { SkillViewComponent } from './components/skill-view/skill-view.component';
import { SnackbarComponent } from './components/snackbar/snackbar.component';
import { TraitViewComponent } from './components/trait-view/trait-view.component';
import { TraitComponent } from './components/trait/trait.component';
import { UltimatumEditModalComponent } from './components/ultimatum-edit-modal/ultimatum-edit-modal.component';
import { UltimatumSlotComponent } from './components/ultimatum-slot/ultimatum-slot.component';
import { UltimatumViewComponent } from './components/ultimatum-view/ultimatum-view.component';
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
        ItemSlotComponent,
        CharacterAnimationComponent,
        ReaperSlotComponent,
        SkillSlotComponent,
        ActivableSlotComponent,
        SkillBarComponent,
        CharacterSettingsMenuComponent,
        CharacterEquipmentComponent,
        UpgradeSlotComponent,
        AncestralLegacySlotComponent,
        AttributeLineComponent,
        TraitComponent,
        MainStatsComponent,
        DeleteBuildModalComponent,
        ImportDataComponent,
        FileUploadButtonComponent,
        CompareItemModalComponent,
        CompareViewComponent,
        ItemReinforcmentEditModalComponent,
        MechanicsViewComponent,
        MergedStatViewComponent,
        UltimatumSlotComponent,
        UltimatumViewComponent,
        UltimatumEditModalComponent,
        OptimizeItemsAffixesModalComponent,
        CreateBuildFromGameComponent,
        CreateBuildFromExportComponent,
        CreateBuildEmptyComponent,
        CreateBuildComponent,
        CreateBuildModalComponent,
        EditBuildModalComponent,
        SearchSelectComponent,
        RunesSlotComponent,
        RuneSlotComponent,
        RuneViewComponent,
    ],
    imports: [
        CommonModule,
        MaterialModule,
    ],
    exports: [
        MaterialModule,
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
        DeleteBuildModalComponent,
        ItemSlotComponent,
        CharacterAnimationComponent,
        ReaperSlotComponent,
        ActivableSlotComponent,
        SkillSlotComponent,
        SkillBarComponent,
        CharacterSettingsMenuComponent,
        CharacterEquipmentComponent,
        UpgradeSlotComponent,
        AncestralLegacySlotComponent,
        AttributeLineComponent,
        TraitComponent,
        MainStatsComponent,
        ImportDataComponent,
        FileUploadButtonComponent,
        CompareItemModalComponent,
        CompareViewComponent,
        ItemReinforcmentEditModalComponent,
        MechanicsViewComponent,
        MergedStatViewComponent,
        UltimatumSlotComponent,
        UltimatumViewComponent,
        UltimatumEditModalComponent,
        CreateBuildComponent,
        CreateBuildModalComponent,
        EditBuildModalComponent,
        SearchSelectComponent,
        RunesSlotComponent,
        RuneSlotComponent,
        RuneViewComponent,
    ],
    providers: [
    ],
})
export class SharedModule { }
