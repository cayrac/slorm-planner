import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClipboardService {
    
    constructor() {}

    public copyToClipboard(value: string): boolean {
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
            return true;
        } catch (e) {
            if (element !== null && document.body.contains(element)) {
                document.body.removeChild(element);
            }
        }
        return false;
    }

    public copyImageToClipboard(blob: Blob): boolean {
        try {
            navigator.clipboard.write([ new ClipboardItem({ 'image/png': blob }) ]);
            return true;
        } catch (_) { }

        return false;
    }

    public async getClipboardText(): Promise<string | null> {
        let text: string | null = null;

        if (navigator.clipboard) {
            try {
                text = await navigator.clipboard.readText();
            } catch (e) {
            }
        }

        return text;
    }
}