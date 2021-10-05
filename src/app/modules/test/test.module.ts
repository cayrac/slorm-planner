import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../shared/material.module';
import { SharedModule } from '../shared/shared.module';
import { TestRoutingModule } from './test-routing.module';
import { TestComponent } from './test.component';


@NgModule({
    declarations: [
        TestComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        TestRoutingModule,
        OverlayModule,
        FormsModule,
        MaterialModule,
    ],
    providers: [
    ],
})
export class TestModule { }
