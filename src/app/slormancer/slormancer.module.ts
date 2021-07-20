import { NgModule } from '@angular/core';

import { SlormancerDataService } from './services/slormancer-data.service';
import { SlormancerEffectValueService } from './services/slormancer-effect-value.service';
import { SlormancerItemParserService } from './services/slormancer-item-parser.service';
import { SlormancerItemValueService } from './services/slormancer-item-value.service';
import { SlormancerItemService } from './services/slormancer-item.service';
import { SlormancerLegendaryEffectService } from './services/slormancer-legendary-effect.service';
import { SlormancerReaperService } from './services/slormancer-reaper.service';
import { SlormancerSaveParserService } from './services/slormancer-save-parser.service';
import { SlormancerSkillService } from './services/slormancer-skill.service';
import { SlormancerTemplateService } from './services/slormancer-template.service';

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
    SlormancerSkillService,
    SlormancerReaperService,
    SlormancerEffectValueService,
  ],
  bootstrap: []
})
export class SlormancerModule {
  
}
