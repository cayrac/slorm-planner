import { Component, Input } from '@angular/core';

import { AncestralLegacy } from '../../../slormancer/model/content/ancestral-legacy';
import { SlormancerTranslateService } from '../../../slormancer/services/content/slormancer-translate.service';

@Component({
  selector: 'app-ancestral-legacy-view',
  templateUrl: './ancestral-legacy-view.component.html',
  styleUrls: ['./ancestral-legacy-view.component.scss']
})
export class AncestralLegacyViewComponent {

    public readonly NEXT_RANK_LABEL = this.slormancerTranslateService.translate('tt_next_rank');
    public readonly MAX_RANK_LABEL = this.slormancerTranslateService.translate('tt_max_rank');

    @Input()
    public readonly ancestralLegacy: AncestralLegacy | null = null;

    @Input()
    public readonly hideNextRank: boolean = false;

    constructor(private slormancerTranslateService: SlormancerTranslateService) { }
}
