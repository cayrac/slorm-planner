import { Injectable } from '@angular/core';

import { DATA_ULTIMATUM } from '../../constants/content/data/data-ultimatum';
import { UltimatumType } from '../../model/content/enum/ultimatum-type';
import { Ultimatum } from '../../model/content/ultimatum';
import { isNotNullOrUndefined } from '../../util/utils';
import { SlormancerEffectValueService } from './slormancer-effect-value.service';
import { SlormancerTemplateService } from './slormancer-template.service';
import { SlormancerTranslateService } from './slormancer-translate.service';

@Injectable()
export class SlormancerUltimatumService {

    private LEVEL_LABEL = this.slormancerTranslateService.translate('level');
    private BONUS_TITLE_LABEL = this.slormancerTranslateService.translate('ultimatum_bonus');
    private MALUS_TITLE_LABEL = this.slormancerTranslateService.translate('ultimatum_malus');

    constructor(private slormancerTranslateService: SlormancerTranslateService,
                private slormancerTemplateService: SlormancerTemplateService,
                private slormancerEffectValueService: SlormancerEffectValueService) { }

    public getUltimatum(type: UltimatumType, level: number): Ultimatum {
        const value = DATA_ULTIMATUM[type].value();
        const result = {
            type,
            level,
            icon: 'ultimatum/' + type,
        
            value,
        
            title: this.slormancerTranslateService.translate('ultimatum_' + type),
            levelLabel: '',
        
            bonusTitle: this.BONUS_TITLE_LABEL,
            bonusLabel: '',
            bonusLabelTemplate: this.slormancerTemplateService.prepareUltimatumTemplate(this.slormancerTranslateService.translate('ultimatum_tt'), value.stat),
        
            malusTitle: this.MALUS_TITLE_LABEL,
            malusLabel: [
                this.slormancerTemplateService.prepareUltimatumTemplate(this.slormancerTranslateService.translate('ultimatum_tt_help'), value.stat),
                DATA_ULTIMATUM[type].extendedMalus
                    ? this.slormancerTemplateService.prepareUltimatumTemplate(this.slormancerTranslateService.translate('ultimatum_tt_help_ext'), value.stat)
                    : null
            ].filter(isNotNullOrUndefined).join('<br/><br/>'),
        
            levelIcon: '',
        };

        this.updateUltimatumModel(result, level);
        this.updateUltimatumView(result);

        return result;
    }

    public updateUltimatumModel(ultimatum: Ultimatum, level: number) {
        ultimatum.level = level;
        this.slormancerEffectValueService.updateEffectValue(ultimatum.value, level);
    }

    public updateUltimatumView(ultimatum: Ultimatum) {
        ultimatum.levelLabel = this.LEVEL_LABEL + ' ' + ultimatum.level;
        ultimatum.levelIcon = 'level/' + ultimatum.level;
        ultimatum.bonusLabel = this.slormancerTemplateService.formatUltimatumTemplate(ultimatum.bonusLabelTemplate, ultimatum.value);
    }

}