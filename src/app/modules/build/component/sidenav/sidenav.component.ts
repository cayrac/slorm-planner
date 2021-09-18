import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import {
    EditLayerModalComponent,
    EditLayerModalData,
} from '../../../shared/components/edit-layer-modal/edit-layer-modal.component';
import {
    ReplacePlannerModalComponent,
} from '../../../shared/components/replace-planner-modal/replace-planner-modal.component';
import { SharedData } from '../../../shared/model/shared-data';
import { ClipboardService } from '../../../shared/services/clipboard.service';
import { DownloadService } from '../../../shared/services/download.service';
import { ImportExportService } from '../../../shared/services/import-export.service';
import { MessageService } from '../../../shared/services/message.service';
import { PlannerService } from '../../../shared/services/planner.service';
import { valueOrNull } from '../../../slormancer/util/utils';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent extends AbstractUnsubscribeComponent implements OnInit {

    @Input()
    private sidenav: MatSidenav | null = null;

    public readonly MAX_UPLOAD_FILE_SIZE_MO = 1;
    public readonly MAX_UPLOAD_FILE_SIZE = 1024 * 1024 * this.MAX_UPLOAD_FILE_SIZE_MO;

    public importResult: SharedData | null = null;

    public importContent = new FormControl(null, Validators.maxLength(this.MAX_UPLOAD_FILE_SIZE));

    constructor(private messageService: MessageService,
                private downloadService: DownloadService,
                private clipboardService: ClipboardService,
                private importExportService: ImportExportService,
                private plannerService: PlannerService,
                private dialog: MatDialog) {
        super();
        this.importContent.valueChanges.subscribe((value: string | null) => {
            const heroClass = this.plannerService.getPlannerclass();
            if (this.importContent.valid && heroClass !== null) {
                if (value !== null && value.length > 0) {
                    this.importResult = this.importExportService.import(value, heroClass);
                } else {
                    this.importResult = null;
                }
            }
        })
    }

    public ngOnInit() {
    }

    private closeSideNav() {
        this.importResult = null;
        this.importContent.setValue(null);
        if (this.sidenav !== null) {
            this.sidenav.close();
        }
    }

    public hasValidImport(): boolean {
        return this.importResult !== null &&
        (this.importResult.character !== null || this.importResult.layer !== null || this.importResult.planner !== null);
    }
    
    public uploadSave(event: Event, input: HTMLInputElement) {
        if (event.target !== null) {
            const files = (<HTMLInputElement>event.target).files;
            const file = files === null ? null : valueOrNull(files[0]);
            if (file !== null) {
                if (file.size <= this.MAX_UPLOAD_FILE_SIZE) {
                    this.upload(file);
                    input.value = '';
                } else {
                    this.messageService.message('Cannot upload files bigger than ' + this.MAX_UPLOAD_FILE_SIZE_MO + 'Mo');
                }
            }
        }
    }

    public upload(file: File) {
        var reader: FileReader | null = new FileReader();

        reader.onerror = () => {
            reader = null;
            this.messageService.message('Failed to upload this file');
        };
        reader.onloadend = () => {
            if (reader !== null && reader.result !== null) {
                this.importContent.setValue(reader.result.toString());
                reader = null;
            }
        };

        reader.readAsText(file);
    }

    public import() {
        const importResult = this.importResult;
        if (importResult !== null) {
            if (importResult.character !== null) {
                const data: EditLayerModalData = {
                    title: 'New character layer\'s name',
                    name: null
                }
                this.dialog.open(EditLayerModalComponent, { data })
                    .afterClosed().subscribe((name: string | null | undefined) => {
                        if (name) {
                            this.plannerService.addLayer(name, importResult.character);
                            this.closeSideNav();
                        }
                    })
            } else if (importResult.layer !== null) {
                this.plannerService.addLayer(importResult.layer.name, importResult.layer.character);
                this.closeSideNav();
            } else if (importResult.planner !== null) {
                this.dialog.open(ReplacePlannerModalComponent)
                    .afterClosed().subscribe((replace: boolean | undefined) => {
                        if (replace === true) {
                            this.plannerService.setPlanner(importResult.planner);
                            this.closeSideNav();
                        }
                    })
            }

        }
    }

    public downloadLayer() {
        const layer = this.plannerService.getSelectedLayer();

        if (layer !== null) {
            const exportedLayer = this.importExportService.exportLayer(layer);
            this.downloadService.downloadFile(exportedLayer, 'layer.sav');
        }
    }

    public copyLayer() {
        const layer = this.plannerService.getSelectedLayer();

        if (layer !== null) {
            const exportedLayer = this.importExportService.exportLayer(layer);
            if (this.clipboardService.copyToClipboard(exportedLayer)) {
                this.messageService.message('Layer copied to clipboard');
            } else {
                this.messageService.error('Failed to copy layer to clipboard');
            }
        }
    }

    public downloadPlanner() {
        const planner = this.plannerService.getPlanner();

        if (planner !== null) {
            const exportedPlanner = this.importExportService.exportPlanner(planner);
            this.downloadService.downloadFile(exportedPlanner, 'build.sav');
        }
    }

    public copyPlanner() {
        const planner = this.plannerService.getPlanner();

        if (planner !== null) {
            const exportedPlanner = this.importExportService.exportPlanner(planner);
            if (this.clipboardService.copyToClipboard(exportedPlanner)) {
                this.messageService.message('Build copied to clipboard');
            } else {
                this.messageService.error('Failed to copy build to clipboard');
            }
        }
    }

    public copyExternalLink() {
        const layer = this.plannerService.getSelectedLayer();

        if (layer !== null) {
            const exportedCharacter = this.importExportService.exportMinimalCharacter(layer.character);
            if (this.clipboardService.copyToClipboard(exportedCharacter)) {
                this.messageService.message('Link copied to clipboard');
            } else {
                this.messageService.error('Failed to copy link to clipboard');
            }
        }
    }
}
