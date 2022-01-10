import { OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_RIPPLE_GLOBAL_OPTIONS, MatOptionModule, RippleGlobalOptions } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions, MatTooltipModule } from '@angular/material/tooltip';


const globalRippleConfig: RippleGlobalOptions = {
    disabled: true,
    animation: {
        enterDuration: 0,
        exitDuration: 0
    }
};

const globalTooltipConfig: MatTooltipDefaultOptions = {
    showDelay: 0,
    hideDelay: 0,
    touchendHideDelay: 0,
    position: 'above'

};

@NgModule({
    declarations: [ ],
    imports: [
        MatTabsModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatSliderModule,
        MatCheckboxModule,
        MatMenuModule,
        MatSnackBarModule,
        MatSidenavModule,
        MatTooltipModule,
        OverlayModule,
        ReactiveFormsModule,
    ],
    exports: [
        MatTabsModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatSliderModule,
        MatCheckboxModule,
        MatMenuModule,
        MatSnackBarModule,
        MatSidenavModule,
        MatTooltipModule,
        OverlayModule,
        ReactiveFormsModule,
    ],
    providers: [
        {provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: globalRippleConfig },
        {provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: globalTooltipConfig }
    ],
})
export class MaterialModule { }
  