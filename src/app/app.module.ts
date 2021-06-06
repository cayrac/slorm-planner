import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SlormancerModule } from './slormancer';
import { HexaToolComponent } from './slormloader/hexa-tool/hexa-tool.component';
import { HexaViewComponent } from './slormloader/hexa-view/hexa-view.component';
import { SlormloaderComponent } from './slormloader/slormloader.component';

@NgModule({
  declarations: [
    AppComponent,
    SlormloaderComponent,
    HexaViewComponent,
    HexaToolComponent
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
