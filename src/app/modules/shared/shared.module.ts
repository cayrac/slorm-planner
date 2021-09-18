import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ActivableViewComponent } from './components/activable-view/activable-view.component';
import { AncestralLegacyViewComponent } from './components/ancestral-legacy-view/ancestral-legacy-view.component';
import { AttributeSummaryViewComponent } from './components/attribute-summary-view/attribute-summary-view.component';
import {
    CharacterLevelEditModalComponent,
} from './components/character-level-edit-modal/character-level-edit-modal.component';
import { DeleteLayerModalComponent } from './components/delete-layer-modal/delete-layer-modal.component';
import { EditLayerModalComponent } from './components/edit-layer-modal/edit-layer-modal.component';
import { ItemBaseChoiceModalComponent } from './components/item-base-choice-modal/item-base-choice-modal.component';
import { ItemEditBuffAttributeComponent } from './components/item-edit-buff-attribute/item-edit-buff-attribute.component';
import { ItemEditBuffReaperComponent } from './components/item-edit-buff-reaper/item-edit-buff-reaper.component';
import { ItemEditBuffSkillComponent } from './components/item-edit-buff-skill/item-edit-buff-skill.component';
import {
    ItemEditLegendaryEffectComponent,
} from './components/item-edit-legendary-effect/item-edit-legendary-effect.component';
import { ItemEditModalComponent } from './components/item-edit-modal/item-edit-modal.component';
import { ItemEditStatComponent } from './components/item-edit-stat/item-edit-stat.component';
import { ItemViewComponent } from './components/item-view/item-view.component';
import { ReaperEditModalComponent } from './components/reaper-edit-modal/reaper-edit-modal.component';
import { ReaperViewComponent } from './components/reaper-view/reaper-view.component';
import { RemoveConfirmModalComponent } from './components/remove-confirm-modal/remove-confirm-modal.component';
import { SkillUpgradeViewComponent } from './components/skill-upgrade-view/skill-upgrade-view.component';
import { SkillViewComponent } from './components/skill-view/skill-view.component';
import { SnackbarComponent } from './components/snackbar/snackbar.component';
import { TraitViewComponent } from './components/trait-view/trait-view.component';
import { MaterialModule } from './material.module';
import { ClipboardService } from './services/clipboard.service';
import { DownloadService } from './services/download.service';
import { FormOptionsService } from './services/form-options.service';
import { ImportExportService } from './services/import-export.service';
import { JsonCompresserService } from './services/json-compresser.service';
import { JsonConverterService } from './services/json-converter.service';
import { MessageService } from './services/message.service';
import { PlannerService } from './services/planner.service';


@NgModule({
    declarations: [
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
        SnackbarComponent,
        EditLayerModalComponent,
        DeleteLayerModalComponent
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
        CharacterLevelEditModalComponent
    ],
    providers: [
        PlannerService,
        FormOptionsService,
        MessageService,
        ImportExportService,
        JsonConverterService,
        ClipboardService,
        DownloadService,
        JsonCompresserService
    ],
})
export class SharedModule { }
