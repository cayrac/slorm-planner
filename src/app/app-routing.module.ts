import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SlormancerProfileComponent } from './slormancer-planner/component/profile/profile.component';

const routes: Routes = [
  { path: 'planner', component: SlormancerProfileComponent },
  { path: '**', redirectTo: 'planner' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
