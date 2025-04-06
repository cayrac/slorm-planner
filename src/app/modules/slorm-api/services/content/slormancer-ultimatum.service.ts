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

    private readonly LEVEL_LABEL: string;
    private readonly BONUS_TITLE_LABEL: string;
    private readonly MALUS_TITLE_LABEL: string;

    constructor(private slormancerTranslateService: SlormancerTranslateService,
                private slormancerTemplateService: SlormancerTemplateService,
                private slormancerEffectValueService: SlormancerEffectValueService) {
        this.LEVEL_LABEL = this.slormancerTranslateService.translate('level');
        this.BONUS_TITLE_LABEL = this.slormancerTranslateService.translate('ultimatum_bonus');
        this.MALUS_TITLE_LABEL = this.slormancerTranslateService.translate('ultimatum_malus');
    }

    public getUltimatumClone(ultimatum: Ultimatum): Ultimatum {
        return {
            ...ultimatum,
            value: this.slormancerEffectValueService.getEffectValueClone(ultimatum.value)
        }
    }

    public getUltimatum(type: UltimatumType, baseLevel: number, bonusLevel: number): Ultimatum {
        const value = DATA_ULTIMATUM[type].value();
        const result = {
            type,
            baseLevel,
            bonusLevel,
            level: 0,
            icon: 'ultimatum/' + type,
            locked: false,
        
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

        this.updateUltimatumModel(result, baseLevel, bonusLevel);
        this.updateUltimatumView(result);

        return result;
    }

    public updateUltimatumModel(ultimatum: Ultimatum, baseLevel: number, bonusLevel: number) {
        ultimatum.baseLevel = baseLevel;
        ultimatum.bonusLevel = bonusLevel;
        ultimatum.level = ultimatum.baseLevel + ultimatum.bonusLevel;
        this.slormancerEffectValueService.updateEffectValue(ultimatum.value, ultimatum.level);
    }

    public updateUltimatumView(ultimatum: Ultimatum) {
        ultimatum.levelLabel = this.LEVEL_LABEL + ' ' + ultimatum.level;
        ultimatum.levelIcon = 'level/' + Math.min(15, ultimatum.level);
        ultimatum.bonusLabel = this.slormancerTemplateService.formatUltimatumTemplate(ultimatum.bonusLabelTemplate, ultimatum.value);
    }

}