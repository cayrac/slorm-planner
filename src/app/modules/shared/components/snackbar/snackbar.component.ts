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

    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: SnackbarData,
                private snackBarRef: MatSnackBarRef<SnackbarComponent>,) {
        this.message = data.message;
    }

    public close() {
        this.snackBarRef.dismiss();
    }
}
