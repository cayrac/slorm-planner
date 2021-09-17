import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslationService } from 'angular-l10n';

@Injectable()
export class ClipboardService {
    private clipboardTextGetErrorNotification = false;

    constructor(private translationService: TranslationService, private matSnackBar: MatSnackBar) {}

    public copyToClipboard(value: string | null, notification = true): boolean {
        if (value === null || value === '') {
            if (notification) {
                // No element to copy
            }
        } else {
            let element: HTMLTextAreaElement | null = null;
            try {
                element = document.createElement('textarea');
                element.style.position = 'fixed';
                element.style.left = '0';
                element.style.top = '0';
                element.style.opacity = '0';
                element.value = value;
                document.body.appendChild(element);
                element.focus();
                element.select();
                document.execCommand('copy');
                document.body.removeChild(element);
                if (notification) {
                    this.matSnackBar.open(
                        this.translationService.translate('profile.textCopy'),
                        this.translationService.translate('close'), { duration: 2000 }
                    );
                }
                return true;
            } catch (e) {
                if (notification) {
                    // Error
                }
                if (element !== null && document.body.contains(element)) {
                    document.body.removeChild(element);
                }
            }
        }
        return false;
    }

    public async getClipboardText(): Promise<string | null> {
        let text: string | null = null;

        if (navigator.clipboard) {
            try {
                text = await navigator.clipboard.readText();
            } catch (e) {
                if (!this.clipboardTextGetErrorNotification) {
                    this.clipboardTextGetErrorNotification = true;
                    // Error
                }
            }
        }

        return text;
    }
}