import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HeroClass } from 'slormancer-api';

import { SharedData } from '../../model/shared-data';
import { ImportExportService } from '../../services/import-export.service';

@Component({
  selector: 'app-import-data',
  templateUrl: './import-data.component.html',
  styleUrls: ['./import-data.component.scss']
})
export class ImportDataComponent {
    
    public readonly MAX_UPLOAD_FILE_SIZE_MO = 1;
    public readonly MAX_UPLOAD_FILE_SIZE = 1024 * 1024 * this.MAX_UPLOAD_FILE_SIZE_MO;
    
    @Input()
    public uploadLabel: string | null = null;

    @Input()
    public importLabel: string | null = null;

    @Input()
    public heroClass: HeroClass | null = null;

    @Output()
    public import = new EventEmitter<SharedData>();

    public sharedData: SharedData | null = null;

    public importContent = new FormControl<string | null>(null, Validators.maxLength(this.MAX_UPLOAD_FILE_SIZE));
    
    constructor(private importExportService: ImportExportService) {
        this.importContent.valueChanges.subscribe(content => {
            if (content === null || content.length === 0) {
                this.sharedData = null;
            } else {
                this.parseExportedData(content);
            }
        });
    }

    private parseExportedData(content: string) {
        this.sharedData = this.importExportService.import(content, this.heroClass);
    }

    public hasValidSharedData(): boolean {
        return this.sharedData !== null && (
            (this.sharedData.character !== null && (this.heroClass === null || this.sharedData.character.heroClass === this.heroClass)) ||
            (this.sharedData.layer !== null && (this.heroClass === null || this.sharedData.layer.character.heroClass === this.heroClass)) ||
            (this.sharedData.planner !== null && (this.heroClass === null || this.sharedData.planner.heroClass === this.heroClass))
        );
    }
    
    public upload(content: string) {
        this.importContent.setValue(content);
    }

    public importData() {
        if (this.sharedData !== null) {
            this.import.emit(this.sharedData);
            this.importContent.setValue('');
            this.sharedData = null;
        }
    }
}
