import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { SelectOption } from '../../../shared/model/select-option';
import { PlannerService } from '../../../shared/services/planner.service';
import { SearchService } from '../inventory/services/search.service';

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
                private searchService: SearchService) {
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

        this.layerControl.valueChanges.subscribe(layer => this.plannerService.setLayer(layer));
        this.searchControl.valueChanges.subscribe(search => this.searchService.setSearch(search));
    }

    public hasSearch(): boolean {
        return this.searchService.hasSearch();
    }

    public removeSearch() {
        this.searchService.setSearch(null)
    }
    
}
