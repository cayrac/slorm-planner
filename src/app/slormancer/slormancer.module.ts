import { NgModule } from '@angular/core';

import { SlormancerItemService } from './services/slormancer-item';
import { SlormancerItemParserService } from './services/slormancer-item-parser.service';
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
