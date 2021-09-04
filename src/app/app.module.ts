import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SlormancerModule } from './slormancer';
import { ActivableViewComponent } from './slormancer-planner/component/activable-view/activable-view.component';
import {
  AncestralLegacyViewComponent,
} from './slormancer-planner/component/ancestral-legacy-view/ancestral-legacy-view.component';
import {
  AttributeSummaryViewComponent,
} from './slormancer-planner/component/attribute-summary-view/attribute-summary-view.component';
import { ItemViewComponent } from './slormancer-planner/component/item-view/item-view.component';
import { JsonComponent } from './slormancer-planner/component/json/json.component';
import { SlormancerProfileComponent } from './slormancer-planner/component/profile/profile.component';
import { ReaperViewComponent } from './slormancer-planner/component/reaper-view/reaper-view.component';
import { SkillUpgradeViewComponent } from './slormancer-planner/component/skill-upgrade-view/skill-upgrade-view.component';
import { SkillViewComponent } from './slormancer-planner/component/skill-view/skill-view.component';
import { TraitViewComponent } from './slormancer-planner/component/trait-view/trait-view.component';
import { SlormancerPlannerComponent } from './slormancer-planner/slormancer-planner.component';

@NgModule({
  declarations: [
    AppComponent,
    JsonComponent,
    SlormancerPlannerComponent,
    ItemViewComponent,
    ReaperViewComponent,
    ActivableViewComponent,
    SkillViewComponent,
    SkillUpgradeViewComponent,
    AncestralLegacyViewComponent,
    TraitViewComponent,
    AttributeSummaryViewComponent,
    SlormancerProfileComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatTabsModule,
    AppRoutingModule,
    SlormancerModule,
    HttpClientModule, // TODO besoin uniquement pour charger rapidement la save, à virer ensuite
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
