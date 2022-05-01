import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { ViewCharacterComponent } from './component/view-character/view-character.component';
import { ViewRoutingModule } from './view-routing.module';
import { ViewComponent } from './view.component';


@NgModule({
    declarations: [
        ViewComponent,
        ViewCharacterComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        ViewRoutingModule,
        OverlayModule,
    ],
    providers: [
    ],
})
export class ViewModule { }
