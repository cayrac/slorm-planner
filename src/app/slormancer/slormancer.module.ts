import { NgModule } from '@angular/core';

import { SlormancerGameDataService } from './services/slormancer-game-data.service';
import { SlormancerItemParserService } from './services/slormancer-item-parser.service';
import { SlormancerItemValueService } from './services/slormancer-item-value.service';
import { SlormancerItemService } from './services/slormancer-item.service';
import { SlormancerSaveParserService } from './services/slormancer-save-parser.service';

@NgModule({
  declarations: [],
  imports: [],
  providers: [
    SlormancerSaveParserService,
    SlormancerItemParserService,
    SlormancerItemValueService,
    SlormancerGameDataService,
    SlormancerItemService,
  ],
  bootstrap: []
})
export class SlormancerModule {
  
}
