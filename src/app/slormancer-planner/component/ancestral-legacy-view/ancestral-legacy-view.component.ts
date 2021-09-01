import { Component, Input } from '@angular/core';

import { AncestralLegacy } from '../../../slormancer/model/ancestral-legacy';
import { AncestralLegacyElement } from '../../../slormancer/model/ancestral-legacy-element';
import { AncestralLegacyType } from '../../../slormancer/model/ancestral-legacy-type';
import { SkillCostType } from '../../../slormancer/model/enum/skill-cost-type';
import { SkillGenre } from '../../../slormancer/model/enum/skill-genre';
import { SlormancerTranslateService } from '../../../slormancer/services/slormancer-translate.service';

@Component({
  selector: 'app-ancestral-legacy-view',
  templateUrl: './ancestral-legacy-view.component.html',
  styleUrls: ['./ancestral-legacy-view.component.scss']
})
export class AncestralLegacyViewComponent {

    public readonly RANK_LABEL = 'tt_rank';
    public readonly MASTERY_LABEL = 'tt_mastery';
    public readonly NEXT_RANK_LABEL = 'tt_next_rank';
    public readonly MAX_RANK_LABEL = 'tt_max_rank';

    @Input()
    public readonly ancestralLegacy: AncestralLegacy | null = null;

    constructor(private slormancerTranslateService: SlormancerTranslateService) { }

    public getCostLabel(costType: SkillCostType): string {
        return this.slormancerTranslateService.translate('tt_' + costType);
    }    
    
    public getElementLabel(element: AncestralLegacyElement): string {
        return this.slormancerTranslateService.translate('element_' + element);
    }

    public getGenresLabel(genres: Array<SkillGenre>): string {
        return genres.map(genre => this.slormancerTranslateService.translate(genre)).join(', ');
    }

    public getTypeLabels(types: Array<AncestralLegacyType>): string {
        return types.map(type => this.slormancerTranslateService.translate('tt_' + type)).join(' - ');
    }

    public translate(key: string): string {
        return this.slormancerTranslateService.translate(key);
    }
}
