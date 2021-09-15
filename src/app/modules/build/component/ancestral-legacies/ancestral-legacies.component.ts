import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { MessageService } from '../../../shared/services/message.service';
import { PlannerService } from '../../../shared/services/planner.service';
import { MAXIMUM_ANCESTRAL_LEGACY_POINTS } from '../../../slormancer/constants/common';
import { Character } from '../../../slormancer/model/character';
import { AncestralLegacy } from '../../../slormancer/model/content/ancestral-legacy';
import { SlormancerAncestralLegacyService } from '../../../slormancer/services/content/slormancer-ancestral-legacy.service';
import { list } from '../../../slormancer/util/math.util';

@Component({
  selector: 'app-ancestral-legacies',
  templateUrl: './ancestral-legacies.component.html',
  styleUrls: ['./ancestral-legacies.component.scss']
})
export class AncestralLegaciesComponent extends AbstractUnsubscribeComponent implements OnInit {

    public readonly ANCESTRAL_LEGACY_POINTS = list(MAXIMUM_ANCESTRAL_LEGACY_POINTS);

    public character: Character | null = null;

    public selectedAncestralLegacy: AncestralLegacy | null = null;

    constructor(private plannerService: PlannerService,
                private slormancerAncestralLegacyService: SlormancerAncestralLegacyService,
                private messageService: MessageService) {
        super();

        // fait flotter MC

        // passer aux attributs
    }

    public ngOnInit() {
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => this.character = character);
    }

    public isPointUnlock(index: number): boolean {
        return this.character !== null && this.character.ancestralLegacies.maxAncestralLegacy > index;
    }

    public optimizeAncestralLegacies() {
        if (this.character !== null) {
            for (const ancestralLegacy of this.character.ancestralLegacies.ancestralLegacies) {
                ancestralLegacy.baseRank = ancestralLegacy.maxRank;
                this.slormancerAncestralLegacyService.updateAncestralLegacy(ancestralLegacy);
            }
            this.plannerService.updateCurrentCharacter();
            this.messageService.message('All ancestral legacies ranks set to maximum');
        }
    }
}
