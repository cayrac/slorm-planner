import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';

import { SnackbarComponent } from '../components/snackbar/snackbar.component';

export interface SnackbarData {
    message: string;
    action: string | null;
    actionCallback: (() => void) | null;
}

@Injectable({ providedIn: 'root' })
export class MessageService {

    private readonly DEFAULT_DURATION = 5000;
    private readonly ACTION_DURATION = 20000;

    private currentSnackBar: MatSnackBarRef<SnackbarComponent> | null = null;

    constructor(private snackBar: MatSnackBar) { }

    private getConfig(message: string, action: string | null = null, actionCallback: (() => void) | null = null): MatSnackBarConfig {
        return {
            duration: (action !== null && actionCallback !== null) ? this.ACTION_DURATION : this.DEFAULT_DURATION,
            data: {
                message,
                action,
                actionCallback
            }
        }
    }

    public message(message: string, action: string | null = null, actionCallback: (() => void) | null = null) {
        this.currentSnackBar = this.snackBar.openFromComponent(SnackbarComponent, this.getConfig(message, action, actionCallback));
    }

    public error(message: string, action: string | null = null, actionCallback: (() => void) | null = null) {

        if (this.currentSnackBar !== null) {
            this.currentSnackBar.dismiss();
        }

        this.currentSnackBar = this.snackBar.openFromComponent(SnackbarComponent, this.getConfig(message, action, actionCallback));
    }
}