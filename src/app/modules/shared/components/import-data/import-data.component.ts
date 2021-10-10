import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { HeroClass } from '../../../slormancer/model/content/enum/hero-class';
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

    public importContent = new FormControl(null, Validators.maxLength(this.MAX_UPLOAD_FILE_SIZE));
    
    public busy: boolean = false;

    public parsing: boolean = false;

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
        this.parsing = true;
        this.importExportService.import(content, this.heroClass).then(sharedData => {
            this.sharedData = sharedData;
            this.parsing = false;
        });
    }

    public hasValidSharedData(): boolean {
        return this.sharedData !== null
            && (this.sharedData.character !== null || this.sharedData.layer !== null || this.sharedData.planner !== null);
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