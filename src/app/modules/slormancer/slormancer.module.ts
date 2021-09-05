import { NgModule } from '@angular/core';

import { SlormancerActivableService } from './services/content/slormancer-activable.service';
import { SlormancerCraftedValueService } from './services/content/slormancer-affix.service';
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
import { SlormancerTemplateService } from './services/content/slormancer-template.service';
import { SlormancerTranslateService } from './services/content/slormancer-translate.service';
import { SlormancerItemParserService } from './services/parser/slormancer-item-parser.service';
import { SlormancerSaveParserService } from './services/parser/slormancer-save-parser.service';
import { SlormancerCharacterService } from './services/slormancer-character.service';

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
    SlormancerCraftedValueService,
    SlormancerTranslateService,
    SlormancerCharacterService
  ],
  bootstrap: []
})
export class SlormancerModule {
  
}
