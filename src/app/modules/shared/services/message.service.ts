import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { SnackbarComponent } from '../components/snackbar/snackbar.component';

export interface SnackbarData {
    message: string;

}

@Injectable()
export class MessageService {

    private readonly SNACKBAR_CONFIG: MatSnackBarConfig = {
        duration: 5000
    }

    constructor(private snackBar: MatSnackBar) {

    }

    public message(message: string) {
        const data: SnackbarData = {
            message
        }
        this.snackBar.openFromComponent(SnackbarComponent, { ...this.SNACKBAR_CONFIG, data });
    }

    public error(message: string) {
        const data: SnackbarData = {
            message
        }
        this.snackBar.openFromComponent(SnackbarComponent, { ...this.SNACKBAR_CONFIG, data });
    }
}