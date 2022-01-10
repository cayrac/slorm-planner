import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import {
    DeleteLayerModalComponent,
    DeleteLayerModalData,
} from '../../../shared/components/delete-layer-modal/delete-layer-modal.component';
import {
    EditLayerModalComponent,
    EditLayerModalData,
} from '../../../shared/components/edit-layer-modal/edit-layer-modal.component';
import { Layer } from '../../../shared/model/layer';
import { SelectOption } from '../../../shared/model/select-option';
import { BuildStorageService } from '../../../shared/services/build-storage.service';
import { BuildService } from '../../../shared/services/build.service';
import { SearchService } from '../../../shared/services/search.service';

@Component({
  selector: 'app-build-header',
  templateUrl: './build-header.component.html',
  styleUrls: ['./build-header.component.scss']
})
export class BuildHeaderComponent extends AbstractUnsubscribeComponent implements OnInit {

    public readonly searchControl = new FormControl('');
    public readonly layerControl = new FormControl(null);

    public layerOptions: Array<SelectOption<Layer>> = [];

    constructor(private buildStorageService: BuildStorageService,
                private buildService: BuildService,
                private searchService: SearchService,
                private dialog: MatDialog) {
        super();
    }

    public ngOnInit() {
        this.buildStorageService.layerChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(layer => this.layerControl.setValue(layer, { emitEvent: false }));
        this.buildStorageService.buildChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(build => {
                this.layerOptions = build === null ? [] : build.layers.map(layer => ({ label: layer.name, value: layer }));
            });
        this.searchService.searchChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(search => this.searchControl.setValue(search, { emitEvent: false }));

        this.layerControl.setValue(this.buildStorageService.getLayer(), { emitEvent: false });

        this.layerControl.valueChanges.subscribe(layer => this.buildStorageService.loadLayer(layer));
        this.searchControl.valueChanges.subscribe(search => this.searchService.setSearch(search));
    }

    public hasSearch(): boolean {
        return this.searchService.hasSearch();
    }

    public removeSearch() {
        this.searchService.setSearch(null)
    }
    
    public editLayer() {
        const layer = this.buildStorageService.getLayer();

        if (layer !== null) {
            const data: EditLayerModalData = {
                title: 'Edit layer name',
                name: layer.name
            }
            this.dialog.open(EditLayerModalComponent, { data })
                .afterClosed().subscribe(name => {
                    if (name) {
                        layer.name = name;
                        this.buildStorageService.saveLayer();
                    }
                });
        }
    }

    public addLayer() {
        const data: EditLayerModalData = {
            title: 'New layer name',
            name: null
        }
        this.dialog.open(EditLayerModalComponent, { data })
        .afterClosed().subscribe(name => {
            const build = this.buildStorageService.getBuild();
            if (name && build !== null) {
                this.buildService.addLayer(build, name)
                this.buildStorageService.saveBuild();
            }
        });
    }

    public duplicateLayer() {
        const data: EditLayerModalData = {
            title: 'New layer name',
            name: null
        }
        this.dialog.open(EditLayerModalComponent, { data })
        .afterClosed().subscribe(name => {
            const build = this.buildStorageService.getBuild();
            const layer = this.buildStorageService.getLayer();
            if (name && build !== null && layer !== null) {
                this.buildService.duplicateLayer(build, layer, name);
                this.buildStorageService.saveBuild();
            }
        });
    }

    public removeLayer() {
        const layer = this.buildStorageService.getLayer();
        const build = this.buildStorageService.getBuild();

        if (layer !== null) {
            const data: DeleteLayerModalData = {
                name: layer.name
            }
            this.dialog.open(DeleteLayerModalComponent, { data })
            .afterClosed().subscribe(del => {
                if (del && build !== null) {
                    this.buildService.deleteLayer(build, layer);
                    this.buildStorageService.saveBuild();
                }
            });
        }
    }

    public hasRoomForMoreLayer(): boolean {
        return this.buildStorageService.hasRoomForAnotherLayer();
    }
}
