import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { CreateBuildModalComponent } from '../../../shared/components/create-build-modal/create-build-modal.component';
import {
    DeleteBuildModalComponent,
    DeleteBuildModalData,
} from '../../../shared/components/delete-build-modal/delete-build-modal.component';
import {
    EditBuildModalComponent,
    EditBuildModalData,
} from '../../../shared/components/edit-build-modal/edit-build-modal.component';
import {
    EditLayerModalComponent,
    EditLayerModalData,
} from '../../../shared/components/edit-layer-modal/edit-layer-modal.component';
import { BuildPreview } from '../../../shared/model/build-preview';
import { SharedData } from '../../../shared/model/shared-data';
import { BuildStorageService } from '../../../shared/services/build-storage.service';
import { BuildService } from '../../../shared/services/build.service';
import { ClipboardService } from '../../../shared/services/clipboard.service';
import { DownloadService } from '../../../shared/services/download.service';
import { ImportExportService } from '../../../shared/services/import-export.service';
import { MessageService } from '../../../shared/services/message.service';
import { HeroClass } from '../../../slormancer/model/content/enum/hero-class';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent extends AbstractUnsubscribeComponent implements OnInit {

    public readonly VERSION = environment.version;

    public readonly GITHUB_LINK = environment.githublink;

    public readonly GAME_LINK = environment.gameLink;

    @Input()
    private sidenav: MatSidenav | null = null;

    public busy: boolean = false;

    public readonly buildControl = new FormControl(this.buildStorageService.getBuildPreview());

    constructor(private messageService: MessageService,
                private downloadService: DownloadService,
                private clipboardService: ClipboardService,
                private importExportService: ImportExportService,
                private buildStorageService: BuildStorageService,
                private buildService: BuildService,
                private router: Router,
                private dialog: MatDialog) {
        super();
        this.buildControl.valueChanges
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(preview => this.buildStorageService.loadBuild(preview));
        this.buildStorageService.buildChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.buildControl.setValue(this.buildStorageService.getBuildPreview(), { emitEvent: false });
            });
    }

    public ngOnInit() {
    }

    private closeSideNav() {
        if (this.sidenav !== null) {
            this.sidenav.close();
        }
    }

    public getBuilds(): Array<BuildPreview> {
        return this.buildStorageService.getBuilds();
    }

    public getHeroClass(): HeroClass {
        let heroClass = HeroClass.Warrior;
        const planner = this.buildStorageService.getBuild();

        if (planner !== null) {
            heroClass = planner.heroClass;
        }

        return heroClass;
    }

    public import(sharedData: SharedData) {
        const build = this.buildStorageService.getBuild();
        if (sharedData !== null && build !== null) {
            if (sharedData.character !== null) {
                const data: EditLayerModalData = {
                    title: 'New character layer\'s name',
                    name: null
                }
                this.dialog.open(EditLayerModalComponent, { data })
                    .afterClosed().subscribe((name: string | null | undefined) => {
                        if (name) {
                            this.buildService.addLayer(build, name, sharedData.character);
                            this.buildStorageService.saveBuild();
                            this.closeSideNav();
                        }
                    })
            } else if (sharedData.layer !== null) {
                this.buildService.addLayer(build, sharedData.layer.name, sharedData.layer.character);
                this.buildStorageService.saveBuild();
                this.closeSideNav();
            } else if (sharedData.planner !== null) {

                for (const layer of sharedData.planner.layers) {
                    this.buildService.addLayer(build, layer.name, layer.character);
                }
                this.buildStorageService.saveBuild();
                this.closeSideNav();
            }

        }
    }

    public downloadLayer() {
        const layer = this.buildStorageService.getLayer();

        if (layer !== null) {
            const exportedLayer = this.importExportService.exportLayer(layer);
            this.downloadService.downloadFile(exportedLayer, layer.name);
        }
    }

    public copyLayer() {
        const layer = this.buildStorageService.getLayer();

        if (layer !== null) {
            const exportedLayer = this.importExportService.exportLayer(layer);
            if (this.clipboardService.copyToClipboard(exportedLayer)) {
                this.messageService.message('Layer copied to clipboard');
            } else {
                this.messageService.error('Failed to copy layer to clipboard');
            }
        }
    }

    public downloadBuild() {
        const build = this.buildStorageService.getBuild();

        if (build !== null) {
            const exportedPlanner = this.importExportService.exportBuild(build);
            this.downloadService.downloadFile(exportedPlanner, 'build.sav');
        }
    }

    public copyBuild() {
        const build = this.buildStorageService.getBuild();

        if (build !== null) {
            const exportedBuild = this.importExportService.exportBuild(build);
            if (this.clipboardService.copyToClipboard(exportedBuild)) {
                this.messageService.message('Build copied to clipboard');
            } else {
                this.messageService.error('Failed to copy build to clipboard');
            }
        }
    }

    public copyExternalLink() {
        const layer = this.buildStorageService.getLayer();

        if (layer !== null) {
            // this.generatingLink = true;
            const link = this.importExportService.exportCharacterAsLink(layer.character);
            if (this.clipboardService.copyToClipboard(link)) {
                this.messageService.message('Link copied to clipboard');
            } else {
                this.messageService.error('Failed to copy link to clipboard');
            }
        }
    }

    public deleteBuild() {
        const build = this.buildStorageService.getBuild();

        if (build !== null) {
            const data: DeleteBuildModalData = {
                name: build.name
            }
            this.dialog.open(DeleteBuildModalComponent, { data })
                .afterClosed().subscribe((confirm: boolean) => {
                    if (confirm) {
                        this.buildStorageService.deleteBuild();

                        console.log(this.buildStorageService.getBuilds());
                        if (this.buildStorageService.getBuilds().length === 0) {
                            console.log('navigate');
                            this.router.navigate(['/create']);
                        }
                    }
                });
        }
        
    }

    public editBuild() {
        const build = this.buildStorageService.getBuild();

        if (build !== null) {
            const data: EditBuildModalData = {
                title: 'Edit build name',
                name: build.name
            }
            this.dialog.open(EditBuildModalComponent, { data })
                .afterClosed().subscribe((name: string) => {
                    if (name) {
                        build.name = name;
                        this.buildStorageService.saveBuild();
                    }
                });
        }
    }

    public createNewBuild() {
        this.dialog.open(CreateBuildModalComponent);
    }

    public trackbyBuildPreview(index: number, preview: BuildPreview): string {
        console.log('trackbyBuildPreview : ', index, preview);
        return preview.storageKey;
    }
}
