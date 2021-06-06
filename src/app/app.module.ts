import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JsonComponent } from './component/json/json.component';
import { HexaComparatorComponent } from './hexa-comparator/hexa-comparator.component';
import { HexaToolComponent } from './hexa-comparator/hexa-tool/hexa-tool.component';
import { HexaViewComponent } from './hexa-comparator/hexa-view/hexa-view.component';
import { SaveComparatorComponent } from './save-comparator/save-comparator.component';
import { SlormancerModule } from './slormancer';

@NgModule({
  declarations: [
    AppComponent,
    HexaComparatorComponent,
    HexaViewComponent,
    HexaToolComponent,
    JsonComponent,
    SaveComparatorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SlormancerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
