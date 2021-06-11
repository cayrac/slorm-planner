import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SlormancerPlannerComponent } from './slormancer-planner/slormancer-planner.component';

const routes: Routes = [
  { path: 'planner', component: SlormancerPlannerComponent },
  { path: '**', redirectTo: 'planner' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
