import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { BuildStorageService } from '../../../shared/services/build-storage.service';
import { MessageService } from '../../../shared/services/message.service';
import { MAXIMUM_ANCESTRAL_LEGACY_POINTS, UNLOCKED_ANCESTRAL_LEGACY_POINTS } from '../../../slormancer/constants/common';
import { Character } from '../../../slormancer/model/character';
import { AncestralLegacy } from '../../../slormancer/model/content/ancestral-legacy';
import { SlormancerAncestralLegacyService } from '../../../slormancer/services/content/slormancer-ancestral-legacy.service';
import { list } from '../../../slormancer/util/math.util';
import { valueOrNull } from '../../../slormancer/util/utils';

@Component({
  selector: 'app-ancestral-legacies',
  templateUrl: './ancestral-legacies.component.html',
  styleUrls: ['./ancestral-legacies.component.scss']
})
export class AncestralLegaciesComponent extends AbstractUnsubscribeComponent implements OnInit {

    public readonly ANCESTRAL_LEGACY_POINTS = list(MAXIMUM_ANCESTRAL_LEGACY_POINTS);

    public character: Character | null = null;

    public selectedAncestralLegacy: AncestralLegacy | null = null;

    constructor(private buildStorageService: BuildStorageService,
                private slormancerAncestralLegacyService: SlormancerAncestralLegacyService,
                private messageService: MessageService) {
        super();
    }

    public ngOnInit() {
        this.buildStorageService.layerChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(layer => {
                this.character = layer === null ? null : layer.character;
                this.selectDefaultAncestralLegacy();
            });
    }

    private selectDefaultAncestralLegacy() {
        this.selectedAncestralLegacy = null;

        if (this.character !== null) {
            if (this.character.ancestralLegacies.activeAncestralLegacies.length > 0) {
                const first = valueOrNull(this.character.ancestralLegacies.activeAncestralLegacies[0]);
                this.selectedAncestralLegacy = first === null ? null : valueOrNull(this.character.ancestralLegacies.ancestralLegacies[first]);
            }

            if (this.selectedAncestralLegacy === null) {
                this.selectedAncestralLegacy = valueOrNull(this.character.ancestralLegacies.ancestralLegacies[0]);
            }
        }
    }

    public isPointUnlock(index: number): boolean {
        return index < UNLOCKED_ANCESTRAL_LEGACY_POINTS;
    }

    public optimizeAncestralLegacies() {
        if (this.character !== null) {
            for (const ancestralLegacy of this.character.ancestralLegacies.ancestralLegacies) {
                ancestralLegacy.baseRank = ancestralLegacy.baseMaxRank;
                this.slormancerAncestralLegacyService.updateAncestralLegacyModel(ancestralLegacy, ancestralLegacy.baseMaxRank);
                this.slormancerAncestralLegacyService.updateAncestralLegacyView(ancestralLegacy);
            }
            this.buildStorageService.saveLayer();
            this.messageService.message('All ancestral legacies ranks set to maximum');
        }
    }
}
