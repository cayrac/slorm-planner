import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';

import { SnackbarComponent } from '../components/snackbar/snackbar.component';

export interface SnackbarData {
    message: string;

}

@Injectable({ providedIn: 'root' })
export class MessageService {

    private currentSnackBar: MatSnackBarRef<SnackbarComponent> | null = null;

    private readonly SNACKBAR_CONFIG: MatSnackBarConfig = {
        duration: 5000,
        
    }

    constructor(private snackBar: MatSnackBar) {

    }

    public message(message: string) {
        const data: SnackbarData = {
            message
        }
        this.currentSnackBar = this.snackBar.openFromComponent(SnackbarComponent, { ...this.SNACKBAR_CONFIG, data });
    }

    public error(message: string) {
        const data: SnackbarData = {
            message
        }

        if (this.currentSnackBar !== null) {
            this.currentSnackBar.dismiss();
        }

        this.currentSnackBar = this.snackBar.openFromComponent(SnackbarComponent, { ...this.SNACKBAR_CONFIG, data });
    }
}