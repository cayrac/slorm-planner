import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

import { SnackbarData } from '../../services/message.service';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent {

    public message: string;

    public action: string | null;

    public actionCallback: (() => void) | null;

    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: SnackbarData,
                private snackBarRef: MatSnackBarRef<SnackbarComponent>,) {
        this.message = data.message;
        this.action = data.action;
        this.actionCallback = data.actionCallback;
    }

    public close() {
        this.snackBarRef.dismiss();
    }

    public actionClick() {
        if (this.actionCallback !== null) {
            this.actionCallback();
        }
        this.close();
    }
}
