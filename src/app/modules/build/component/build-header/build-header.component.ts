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
import { SelectOption } from '../../../shared/model/select-option';
import { PlannerService } from '../../../shared/services/planner.service';
import { SearchService } from '../../../shared/services/search.service';
import { valueOrNull } from '../../../slormancer/util/utils';

@Component({
  selector: 'app-build-header',
  templateUrl: './build-header.component.html',
  styleUrls: ['./build-header.component.scss']
})
export class BuildHeaderComponent extends AbstractUnsubscribeComponent implements OnInit {

    public readonly searchControl = new FormControl('');
    public readonly layerControl = new FormControl(null);

    public layerOptions: Array<SelectOption<number>> = [];

    constructor(private plannerService: PlannerService,
                private searchService: SearchService,
                private dialog: MatDialog) {
        super();
    }

    public ngOnInit() {
        this.plannerService.selectedLayerIndexChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(layer => this.layerControl.setValue(layer, { emitEvent: false }));
        this.plannerService.layersChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(layers => this.layerOptions = layers.map((layer, index) => ({ label: layer.name, value: index })));
        this.searchService.searchChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(search => this.searchControl.setValue(search, { emitEvent: false }));

        this.layerControl.setValue(this.plannerService.getSelectedLayerIndex(), { emitEvent: false });

        this.layerControl.valueChanges.subscribe(layer => this.plannerService.setLayerIndex(layer));
        this.searchControl.valueChanges.subscribe(search => this.searchService.setSearch(search));
    }

    public hasSearch(): boolean {
        return this.searchService.hasSearch();
    }

    public removeSearch() {
        this.searchService.setSearch(null)
    }
    
    public editLayer() {
        const layer = valueOrNull(this.plannerService.getLayers()[this.plannerService.getSelectedLayerIndex()]);

        if (layer !== null) {
            const data: EditLayerModalData = {
                title: 'Edit layer name',
                name: layer.name
            }
            this.dialog.open(EditLayerModalComponent, { data })
                .afterClosed().subscribe(name => {
                    if (name) {
                        this.plannerService.setLayerName(this.plannerService.getSelectedLayerIndex(), name);
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
            if (name) {
                this.plannerService.addLayer(name);
            }
        });
    }

    public copyLayer() {
        const data: EditLayerModalData = {
            title: 'New layer name',
            name: null
        }
        this.dialog.open(EditLayerModalComponent, { data })
        .afterClosed().subscribe(name => {
            if (name) {
                this.plannerService.copyLayer(this.plannerService.getSelectedLayerIndex(), name);
            }
        });
    }

    public removeLayer() {
        const layer = valueOrNull(this.plannerService.getLayers()[this.plannerService.getSelectedLayerIndex()]);

        if (layer !== null) {
            const data: DeleteLayerModalData = {
                name: layer.name
            }
            this.dialog.open(DeleteLayerModalComponent, { data })
            .afterClosed().subscribe(del => {
                if (del) {
                    this.plannerService.removeLayer(this.plannerService.getSelectedLayerIndex());
                }
            });
        }
    }
}
