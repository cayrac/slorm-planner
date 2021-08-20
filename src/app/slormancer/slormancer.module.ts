import { NgModule } from '@angular/core';

import { SlormancerActivableService } from './services/slormancer-activable.service';
import { SlormancerDataService } from './services/slormancer-data.service';
import { SlormancerEffectValueService } from './services/slormancer-effect-value.service';
import { SlormancerItemParserService } from './services/slormancer-item-parser.service';
import { SlormancerItemValueService } from './services/slormancer-item-value.service';
import { SlormancerItemService } from './services/slormancer-item.service';
import { SlormancerLegendaryEffectService } from './services/slormancer-legendary-effect.service';
import { SlormancerReaperValueService } from './services/slormancer-reaper-value.service';
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
    SlormancerActivableService,
    SlormancerSkillService,
    SlormancerReaperService,
    SlormancerEffectValueService,
    SlormancerReaperValueService,
  ],
  bootstrap: []
})
export class SlormancerModule {
  
}
