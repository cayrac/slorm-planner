import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HexaComparatorComponent } from './hexa-comparator/hexa-comparator.component';
import { SaveComparatorComponent } from './save-comparator/save-comparator.component';

const routes: Routes = [
  { path: 'hexa-comparator', component: HexaComparatorComponent },
  { path: 'save-comparator', component: SaveComparatorComponent },
  { path: '**', redirectTo: 'hexa-comparator' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
