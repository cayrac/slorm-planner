import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SlormancerModule } from './slormancer';
import { JsonComponent } from './slormancer-planner/component/json/json.component';
import { SlormancerPlannerComponent } from './slormancer-planner/slormancer-planner.component';

@NgModule({
  declarations: [
    AppComponent,
    JsonComponent,
    SlormancerPlannerComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    SlormancerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
