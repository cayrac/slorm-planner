import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
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
        MatIconModule,
        MatCardModule,
        MatDialogModule,
        MatFormFieldModule
    ],
    exports: [
        MatTabsModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatDialogModule,
        MatFormFieldModule
    ],
    providers: [
        {provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: globalRippleConfig}
    ],
})
export class MaterialModule { }
  