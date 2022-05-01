import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [
    { path: 'slorm-planner', loadChildren: () => import('./modules/slorm-planner/slorm-planner.module').then((m) => m.SlormPlannerModule) },
    { path: '**', pathMatch: 'full', redirectTo: 'slorm-planner' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }