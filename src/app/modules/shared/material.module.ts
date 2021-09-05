import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

const globalRippleConfig: RippleGlobalOptions = {
    disabled: true,
    animation: {
      enterDuration: 0,
      exitDuration: 0
    }
  };

@NgModule({
    declarations: [ ],
    imports: [
        MatTabsModule,
        MatButtonModule,
        MatIconModule
    ],
    exports: [
        MatTabsModule,
        MatButtonModule,
        MatIconModule
    ],
    providers: [
        {provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: globalRippleConfig}
    ],
})
export class MaterialModule { }
  