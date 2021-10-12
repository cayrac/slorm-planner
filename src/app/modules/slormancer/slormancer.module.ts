import { NgModule } from '@angular/core';

import { SlormancerActivableService } from './services/content/slormancer-activable.service';
import { SlormancerAffixService } from './services/content/slormancer-affix.service';
import { SlormancerAncestralLegacyService } from './services/content/slormancer-ancestral-legacy.service';
import { SlormancerAttributeService } from './services/content/slormancer-attribute.service';
import { SlormancerBuffService } from './services/content/slormancer-buff.service';
import { SlormancerDataService } from './services/content/slormancer-data.service';
import { SlormancerEffectValueService } from './services/content/slormancer-effect-value.service';
import { SlormancerItemValueService } from './services/content/slormancer-item-value.service';
import { SlormancerItemService } from './services/content/slormancer-item.service';
import { SlormancerLegendaryEffectService } from './services/content/slormancer-legendary-effect.service';
import { SlormancerMechanicService } from './services/content/slormancer-mechanic.service';
import { SlormancerReaperValueService } from './services/content/slormancer-reaper-value.service';
import { SlormancerReaperService } from './services/content/slormancer-reaper.service';
import { SlormancerSkillService } from './services/content/slormancer-skill.service';
import { SlormancerStatMappingService } from './services/content/slormancer-stat-mapping.service';
import { SlormancerStatsExtractorService } from './services/content/slormancer-stats-extractor.service';
import { SlormancerStatUpdaterService } from './services/content/slormancer-stats-updater.service';
import { SlormancerStatsService } from './services/content/slormancer-stats.service';
import { SlormancerSynergyResolverService } from './services/content/slormancer-synergy-resolver.service';
import { SlormancerTemplateService } from './services/content/slormancer-template.service';
import { SlormancerTranslateService } from './services/content/slormancer-translate.service';
import { SlormancerValueUpdater } from './services/content/slormancer-value-updater.service';
import { SlormancerItemParserService } from './services/parser/slormancer-item-parser.service';
import { SlormancerSaveParserService } from './services/parser/slormancer-save-parser.service';
import { SlormancerCharacterBuilderService } from './services/slormancer-character-builder.service';
import { SlormancerCharacterComparatorService } from './services/slormancer-character-comparator.service';
import { SlormancerCharacterModifierService } from './services/slormancer-character.modifier.service';
import { SlormancerCharacterUpdaterService } from './services/slormancer-character.updater.service';
import { SlormancerDpsService } from './services/slormancer-dps-service';

@NgModule({
  declarations: [],
  imports: [],
  providers: [
    SlormancerLegendaryEffectService,
    SlormancerSaveParserService,
    SlormancerItemParserService,
    SlormancerItemValueService,
    SlormancerDataService,
    SlormancerItemService,
    SlormancerTemplateService,
    SlormancerActivableService,
    SlormancerSkillService,
    SlormancerReaperService,
    SlormancerEffectValueService,
    SlormancerReaperValueService,
    SlormancerMechanicService,
    SlormancerBuffService,
    SlormancerAncestralLegacyService,
    SlormancerAttributeService,
    SlormancerAffixService,
    SlormancerTranslateService,
    SlormancerCharacterUpdaterService,
    SlormancerStatsService,
    SlormancerStatsExtractorService,
    SlormancerCharacterUpdaterService,
    SlormancerCharacterBuilderService,
    SlormancerSynergyResolverService,
    SlormancerStatUpdaterService,
    SlormancerCharacterModifierService,
    SlormancerValueUpdater,
    SlormancerStatMappingService,
    SlormancerDpsService,
    SlormancerCharacterComparatorService
  ],
  bootstrap: []
})
export class SlormancerModule {
  
}
