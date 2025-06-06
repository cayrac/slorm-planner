import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private readonly STORAGE_KEY = 'selected_language';

    constructor() {}

    private getStoredLanguage(): string {
        return localStorage.getItem(this.STORAGE_KEY) || 'EN';
    }

    setLanguage(languageCode: string): void {
        localStorage.setItem(this.STORAGE_KEY, languageCode);
        location.reload();
    }

    getCurrentLanguage(): string {
        return this.getStoredLanguage();
    }
} 