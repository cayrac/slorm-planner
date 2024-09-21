import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AbstractUnsubscribeComponent } from '@shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { Layer } from '@shared/model/layer';
import { BuildStorageService } from '@shared/services/build-storage.service';
import { CharacterStatDifference, SlormancerCharacterComparatorService } from '@slorm-api';
import { takeUntil } from 'rxjs/operators';

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

    public readonly layerControl = new FormControl<Layer | null>(null);

    constructor(private buildStorageService: BuildStorageService,
                private slormancerCharacterComparatorService: SlormancerCharacterComparatorService) {
        super();
        this.buildStorageService.buildChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(build => {
                this.layers = build === null ? [] : build.layers;
                this.layerControl.setValue(this.layers[0] ?? null);
            });
        this.buildStorageService.layerChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(layer => {
                this.currentLayer = layer;
                if (layer !== null) {
                    const layerIndex = this.layers.indexOf(layer);
                    if (layerIndex !== -1) {
                        const newCompareToIndex = layerIndex === 0 && this.layers.length > 1 ? 1 : 0;
                        this.layerControl.setValue(this.layers[newCompareToIndex] ?? null);
                        this.updateDifferences()
                    }
                }
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
