import { Component, OnInit } from '@angular/core';
import { AbstractUnsubscribeComponent } from '@shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { BuildStorageService } from '@shared/services/build-storage.service';
import { MessageService } from '@shared/services/message.service';
import {
    AncestralLegacy,
    Character,
    list,
    MAXIMUM_ANCESTRAL_LEGACY_POINTS,
    SlormancerAncestralLegacyService,
    SlormancerTranslateService,
    valueOrNull,
} from '@slorm-api';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-ancestral-legacies',
  templateUrl: './ancestral-legacies.component.html',
  styleUrls: ['./ancestral-legacies.component.scss']
})
export class AncestralLegaciesComponent extends AbstractUnsubscribeComponent implements OnInit {

    public readonly MIGHT_MESSAGE: string; 

    public readonly ANCESTRAL_LEGACY_POINTS = list(MAXIMUM_ANCESTRAL_LEGACY_POINTS);

    public character: Character | null = null;

    public selectedAncestralLegacy: AncestralLegacy | null = null;

    constructor(private buildStorageService: BuildStorageService,
                private slormancerAncestralLegacyService: SlormancerAncestralLegacyService,
                private messageService: MessageService,
                private slormancerTranslateService: SlormancerTranslateService) {
        super();
        this.MIGHT_MESSAGE = this.slormancerTranslateService.translate('bonus_elemental_damage');
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

    public optimizeAncestralLegacies() {
        if (this.character !== null) {
            for (const ancestralLegacy of this.character.ancestralLegacies.ancestralLegacies) {
                ancestralLegacy.baseRank = ancestralLegacy.baseMaxRank;
                this.slormancerAncestralLegacyService.updateAncestralLegacyModel(ancestralLegacy, ancestralLegacy.baseMaxRank, ancestralLegacy.bonusRank, ancestralLegacy.forcedRank);
                this.slormancerAncestralLegacyService.updateAncestralLegacyView(ancestralLegacy);
            }
            this.buildStorageService.saveLayer();
            this.messageService.message('All ancestral legacies ranks set to maximum');
        }
    }

    public isStoneUsed(index: number): boolean {
        const usedStones = this.character === null ? 0 : this.character.ancestralLegacies.activeNodes.length;
        return MAXIMUM_ANCESTRAL_LEGACY_POINTS - index <= usedStones;
    }

    public isAncestralStoneUsed(): boolean {
        return this.character !== null && this.character.ancestralLegacies.activeFirstNode !== null;
    }
}
