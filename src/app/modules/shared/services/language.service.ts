import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private readonly STORAGE_KEY = 'selected_language';
    private languageSubject: BehaviorSubject<string>;

    constructor() {
        const savedLanguage = this.getStoredLanguage();
        this.languageSubject = new BehaviorSubject<string>(savedLanguage);
    }

    /**
     * 获取存储的语言代码
     */
    private getStoredLanguage(): string {
        return localStorage.getItem(this.STORAGE_KEY) || 'EN';
    }

    /**
     * 设置语言
     * @param languageCode 语言代码
     */
    setLanguage(languageCode: string): void {
        localStorage.setItem(this.STORAGE_KEY, languageCode);
        this.languageSubject.next(languageCode);
    }

    /**
     * 获取当前语言
     */
    getCurrentLanguage(): string {
        return this.getStoredLanguage();
    }

    /**
     * 获取语言变更的观察对象
     */
    getLanguageChanges(): Observable<string> {
        return this.languageSubject.asObservable();
    }
} 