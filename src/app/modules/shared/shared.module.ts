import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ActivableViewComponent } from './components/activable-view/activable-view.component';
import { AncestralLegacyViewComponent } from './components/ancestral-legacy-view/ancestral-legacy-view.component';
import { AttributeSummaryViewComponent } from './components/attribute-summary-view/attribute-summary-view.component';
import { ItemViewComponent } from './components/item-view/item-view.component';
import { ReaperViewComponent } from './components/reaper-view/reaper-view.component';
import { SkillUpgradeViewComponent } from './components/skill-upgrade-view/skill-upgrade-view.component';
import { SkillViewComponent } from './components/skill-view/skill-view.component';
import { TraitViewComponent } from './components/trait-view/trait-view.component';
import { MaterialModule } from './material.module';
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
    ],
    imports: [
        CommonModule,
        MaterialModule
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
    ],
    providers: [PlannerService],
})
export class SharedModule { }
