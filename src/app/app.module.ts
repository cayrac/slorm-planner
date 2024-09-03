import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SlormancerModule } from 'slormancer-api';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SlormToolsComponent } from './core/components/slorm-tools/slorm-tools.component';
import { MaterialModule } from './modules/shared/material.module';
import { CustomSlormancerItemValueService } from './custom-slormancer-item-value.service';

@NgModule({
    declarations: [
        AppComponent,
        SlormToolsComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        SlormancerModule,
        AppRoutingModule,
        MaterialModule,
        HttpClientModule,
    ],
    providers: [ CustomSlormancerItemValueService ],
    bootstrap: [AppComponent]
})
export class AppModule { }
