import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { SharedData } from '../../../shared/model/shared-data';
import { ImportExportService } from '../../../shared/services/import-export.service';
import { MessageService } from '../../../shared/services/message.service';
import { PlannerService } from '../../../shared/services/planner.service';
import { valueOrNull } from '../../../slormancer/util/utils';

@Component({
    selector: 'app-create-build-from-export',
    templateUrl: './create-build-from-export.component.html',
    styleUrls: ['./create-build-from-export.component.scss']
})
export class CreateBuildFromExportComponent {

    public readonly MAX_UPLOAD_FILE_SIZE_MO = 1;
    public readonly MAX_UPLOAD_FILE_SIZE = 1024 * 1024 * this.MAX_UPLOAD_FILE_SIZE_MO;

    public busy: boolean = false;

    public parsing: boolean = false;

    public sharedData: SharedData | null = null;

    public importContent = new FormControl(null, Validators.maxLength(this.MAX_UPLOAD_FILE_SIZE));

    constructor(private messageService: MessageService,
                private router: Router,
                private plannerService: PlannerService,
                private importExportService: ImportExportService) {
        this.importContent.valueChanges.subscribe(content => {
            if (content === null || content.length === 0) {
                this.sharedData = null;
            } else {
                this.parseExportedData(content);
            }
        });
    }
    
    private uploadFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            var reader: FileReader | null = new FileReader();
    
            reader.onerror = () => {
                reader = null;
                reject();
            };
            reader.onloadend = () => {
                if (reader !== null && reader.result !== null) {
                    resolve(reader.result.toString());
                    reader = null;
                }
            };
    
            reader.readAsText(file);
        })
    }

    private parseExportedData(content: string) {
        this.parsing = true;
        this.importExportService.import(content).then(sharedData => {
            this.sharedData = sharedData;
            this.parsing = false;
        });
    }

    public uploadExportedData(event: Event) {
        if (event.target !== null && !this.busy) {
            const files = (<HTMLInputElement>event.target).files;
            const file = files === null ? null : valueOrNull(files[0]);
            if (file !== null) {
                if (file.size <= this.MAX_UPLOAD_FILE_SIZE) {
                    this.busy = true;
                    this.uploadFile(file).then(
                        content => {
                            this.importContent.setValue(content);
                            this.busy = false;
                        },
                        () => {
                            this.messageService.error('Failed to upload this file');
                            this.busy = false;
                        }
                    );
                } else {
                    this.messageService.error('Cannot upload files bigger than ' + this.MAX_UPLOAD_FILE_SIZE_MO + 'Mo');
                }
            }
        }
    }
    
    public createBuild() {
        const sharedData = this.sharedData;
        if (sharedData !== null) {
            if (sharedData.character !== null) {
                this.plannerService.createNewPlanner(sharedData.character.heroClass, sharedData.character);
                this.router.navigate(['/build']);
            } else if (sharedData.layer !== null) {
                this.plannerService.createNewPlanner(sharedData.layer.character.heroClass, sharedData.layer.character, sharedData.layer.name);
                this.router.navigate(['/build']);
            } else if (sharedData.planner !== null) {
                this.plannerService.setPlanner(sharedData.planner);
                this.router.navigate(['/build']);
            }
        }
    }

    public hasValidSharedData(): boolean {
        return this.sharedData !== null
            && (this.sharedData.character !== null || this.sharedData.layer !== null || this.sharedData.planner !== null);
    }
}
