import { NgModule } from '@angular/core';

import { SlormancerGameDataService } from './services/slormancer-data.service';
import { SlormancerItemParserService } from './services/slormancer-item-parser.service';
import { SlormancerItemValueService } from './services/slormancer-item-value.service';
import { SlormancerItemService } from './services/slormancer-item.service';
import { SlormancerLegendaryEffectService } from './services/slormancer-legendary-effect.service';
import { SlormancerSaveParserService } from './services/slormancer-save-parser.service';
import { SlormancerTemplateService } from './services/slormancer-template.service';

@NgModule({
  declarations: [],
  imports: [],
  providers: [
    SlormancerLegendaryEffectService,
    SlormancerSaveParserService,
    SlormancerItemParserService,
    SlormancerItemValueService,
    SlormancerGameDataService,
    SlormancerItemService,
    SlormancerTemplateService,
  ],
  bootstrap: []
})
export class SlormancerModule {
  
}
