import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';

import { environment } from '../../../../../environments/environment';
import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import {
    ContentBlockedModalComponent,
} from '../../../shared/components/content-blocked-modal/content-blocked-modal.component';
import { DeletePlannerModalComponent } from '../../../shared/components/delete-planner-modal/delete-planner-modal.component';
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
import { HeroClass } from '../../../slormancer/model/content/enum/hero-class';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent extends AbstractUnsubscribeComponent implements OnInit {

    public readonly VERSION = environment.version;

    public readonly GITHUB = environment.github;

    @Input()
    private sidenav: MatSidenav | null = null;

    public busy: boolean = false;

    public generatingLink: boolean = false;

    constructor(private messageService: MessageService,
                private downloadService: DownloadService,
                private clipboardService: ClipboardService,
                private importExportService: ImportExportService,
                private plannerService: PlannerService,
                private router: Router,
                private dialog: MatDialog) {
        super();
    }

    public ngOnInit() {
    }

    private closeSideNav() {
        if (this.sidenav !== null) {
            this.sidenav.close();
        }
    }

    public getHeroClass(): HeroClass {
        let heroClass = HeroClass.Warrior;
        const planner = this.plannerService.getPlanner();

        if (planner !== null) {
            heroClass = planner.heroClass;
        }

        return heroClass;
    }

    public import(sharedData: SharedData) {
        if (sharedData !== null) {
            if (sharedData.character !== null) {
                const data: EditLayerModalData = {
                    title: 'New character layer\'s name',
                    name: null
                }
                this.dialog.open(EditLayerModalComponent, { data })
                    .afterClosed().subscribe((name: string | null | undefined) => {
                        if (name) {
                            this.plannerService.addLayer(name, sharedData.character);
                            this.closeSideNav();
                        }
                    })
            } else if (sharedData.layer !== null) {
                this.plannerService.addLayer(sharedData.layer.name, sharedData.layer.character);
                this.closeSideNav();
            } else if (sharedData.planner !== null) {
                this.dialog.open(ReplacePlannerModalComponent)
                    .afterClosed().subscribe((replace: boolean | undefined) => {
                        if (replace === true) {
                            this.plannerService.setPlanner(sharedData.planner);
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

        if (layer !== null && !this.generatingLink) {
            this.generatingLink = true;
            this.importExportService.exportCharacterAsLink(layer.character)
                .then(
                    result => {
                        if (result !== null && this.clipboardService.copyToClipboard(result)) {
                            this.messageService.message('Link copied to clipboard');
                        } else {
                            this.messageService.error('Failed to copy link to clipboard : ' + result);
                        }
                        this.generatingLink = false;
                    },
                    (error: HttpErrorResponse) => {
                        if (!error.ok && error.status === 0) {
                            this.messageService.error('The link creation request has been blocked', 'Why ?',() => this.dialog.open(ContentBlockedModalComponent));
                            // TODO
                        } else {
                            this.messageService.error('Failed to create link to current layer');
                        }
                        this.generatingLink = false;
                    });
        }
    }

    public createNewBuild() {
        this.dialog.open(DeletePlannerModalComponent)
            .afterClosed().subscribe((result: boolean | undefined) => {
                if (result === true) {
                    this.plannerService.deletePlanner();
                    this.router.navigate(['/create']);
                }
            })
        
    }
}
