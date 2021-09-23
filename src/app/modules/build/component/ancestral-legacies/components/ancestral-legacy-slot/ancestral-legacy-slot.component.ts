import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { PlannerService } from '../../../../../shared/services/planner.service';
import { AncestralLegacy } from '../../../../../slormancer/model/content/ancestral-legacy';
import {
    SlormancerAncestralLegacyService,
} from '../../../../../slormancer/services/content/slormancer-ancestral-legacy.service';
import { SearchService } from '../../../inventory/services/search.service';


@Component({
  selector: 'app-ancestral-legacy-slot',
  templateUrl: './ancestral-legacy-slot.component.html',
  styleUrls: ['./ancestral-legacy-slot.component.scss']
})
export class AncestralLegacySlotComponent extends AbstractUnsubscribeComponent implements OnInit {

    @Input()
    public readonly ancestralLegacy: AncestralLegacy | null = null;

    @Input()
    public readonly equipped: boolean = false;
    
    @Input()
    public readonly selected: boolean = false;

    @Output()
    public readonly changed = new EventEmitter<AncestralLegacy>();

    public hiddenBySearch: boolean = false;

    constructor(private searchService: SearchService,
                private slormancerAncestralLegacyService: SlormancerAncestralLegacyService,
                private plannerService: PlannerService) {
        super();
    }

    public ngOnInit() {
        this.searchService.searchChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(search => this.hiddenBySearch = search !== null && this.ancestralLegacy !== null && !this.searchService.ancestralLegacyMatchSearch(this.ancestralLegacy))
    }

    private setRank(ancestralLegacy: AncestralLegacy, newRank: number) {
        if (ancestralLegacy.baseRank !== newRank && this.selected) {
            this.slormancerAncestralLegacyService.updateAncestralLegacyModel(ancestralLegacy, newRank);
            this.slormancerAncestralLegacyService.updateAncestralLegacyView(ancestralLegacy);
            this.plannerService.updateCurrentCharacter();
        }
    }

    public increasesRank(): boolean {
        if (this.ancestralLegacy !== null) {
            this.setRank(this.ancestralLegacy, Math.max(0, this.ancestralLegacy.baseRank + 1));
            this.changed.emit(this.ancestralLegacy);
        }
        return false;
    }
 
    public decreasesRank(): boolean {
        if (this.ancestralLegacy !== null) {
            this.setRank(this.ancestralLegacy, Math.max(0, this.ancestralLegacy.baseRank - 1));
            this.changed.emit(this.ancestralLegacy);
        }
        return false;
    }
}
    
