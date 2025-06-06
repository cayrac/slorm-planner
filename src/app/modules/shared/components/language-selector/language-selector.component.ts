import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../../services/language.service';

interface Language {
  code: string;
  displayName: string;
}

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent implements OnInit {
  languages: Language[] = [
    { code: 'EN', displayName: 'English' },
    { code: 'FR', displayName: 'Français' },
    { code: 'CH', displayName: '简体中文' },
    { code: 'TW', displayName: '繁體中文' },
    { code: 'JP', displayName: '日本語' },
    { code: 'DE', displayName: 'Deutsch' },
    { code: 'ES', displayName: 'Español' },
    { code: 'RU', displayName: 'Русский' },
    { code: 'KR', displayName: '한국어' }
  ];

  selectedLanguage: string;

  constructor(private languageService: LanguageService) {
    this.selectedLanguage = this.languageService.getCurrentLanguage();
  }

  ngOnInit(): void {}

  onLanguageChange(): void {
    this.languageService.setLanguage(this.selectedLanguage);
  }
} 