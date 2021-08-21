import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SlormancerModule } from './slormancer';
import { ActivableViewComponent } from './slormancer-planner/component/activable-view/activable-view.component';
import { ItemViewComponent } from './slormancer-planner/component/item-view/item-view.component';
import { JsonComponent } from './slormancer-planner/component/json/json.component';
import { ReaperViewComponent } from './slormancer-planner/component/reaper-view/reaper-view.component';
import { SkillUpgradeViewComponent } from './slormancer-planner/component/skill-upgrade-view/skill-upgrade-view.component';
import { SkillViewComponent } from './slormancer-planner/component/skill-view/skill-view.component';
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
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    SlormancerModule,
    NgxChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
