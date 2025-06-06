import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

interface Language {
  code: string;
  displayName: string;
}

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ]
})
export class LanguageSelectorComponent {
  languages: Language[] = [
    { code: 'EN', displayName: 'English' },
    { code: 'FR', displayName: 'French' },
    { code: 'CH', displayName: 'Chinese Simplified' },
    { code: 'TW', displayName: 'Chinese Traditional' },
    { code: 'JP', displayName: 'Japanese' },
    { code: 'DE', displayName: 'German' },
    { code: 'ES', displayName: 'Spanish' },
    { code: 'RU', displayName: 'Russian' },
    { code: 'KR', displayName: 'Korean' }
  ];

  selectedLanguage: string = 'EN';

  onLanguageChange(): void {
    // 暂时留空，后续可以添加具体实现
    console.log('Selected language:', this.selectedLanguage);
  }
} 