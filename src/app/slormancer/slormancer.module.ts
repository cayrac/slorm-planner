import { NgModule } from '@angular/core';

import { SlormancerItemParserService } from './services/slormancer-item-parser.service';
import { SlormancerItemService } from './services/slormancer-item.service';
import { SlormancerSaveParserService } from './services/slormancer-save-parser.service';

@NgModule({
  declarations: [],
  imports: [],
  providers: [
    SlormancerSaveParserService,
    SlormancerItemParserService,
    SlormancerItemService
  ],
  bootstrap: []
})
export class SlormancerModule {
  
}
