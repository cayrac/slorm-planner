import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { Layer } from '../../../shared/model/layer';
import { PlannerService } from '../../../shared/services/planner.service';
import { CharacterStatDifference } from '../../../slormancer/model/character-stat-differences';
import { SlormancerCharacterComparatorService } from '../../../slormancer/services/slormancer-character-comparator.service';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss']
})
export class CompareComponent extends AbstractUnsubscribeComponent implements OnInit {

    public differences: Array<CharacterStatDifference> | null = null;
    
    public currentLayer: Layer | null = null;

    public layers: Array<Layer> = [];

    public config: FormGroup | null = null;

    public readonly layerControl = new FormControl(0);

    constructor(private plannerService: PlannerService,
                private slormancerCharacterComparatorService: SlormancerCharacterComparatorService) {
        super();
        this.plannerService.layersChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(layers => {
                this.layers = layers;
                this.layerControl.setValue(this.layers[0]);
            });
        this.plannerService.selectedLayerIndexChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(index => {
                const layers = this.plannerService.getLayers();
                const newCompareToIndex = index === 0 && layers.length > 1 ? 1 : 0;
                this.currentLayer = <Layer>layers[index];
                this.layerControl.setValue(layers[newCompareToIndex]);
                this.updateDifferences()
            });
        this.layerControl.valueChanges.subscribe(() => this.updateDifferences())
    }

    public ngOnInit() {
    }

    public updateDifferences() {
        this.differences = null;
        if (this.currentLayer !== null && this.layerControl.value && this.currentLayer !== this.layerControl.value) {
            this.differences = this.slormancerCharacterComparatorService.compareCharacters(this.currentLayer.character, this.layerControl.value.character);
        }
    }
}
