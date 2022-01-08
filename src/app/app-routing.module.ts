import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HasPlannerGuard } from './guard/has-build.guard';
import { HasNoBuildGuard } from './guard/has-no-build.guard';

const appRoutes: Routes = [
  { path: 'build', canActivate: [HasPlannerGuard], loadChildren: () => import('./modules/build/build.module').then((m) => m.BuildModule) },
  { path: 'view', loadChildren: () => import('./modules/view/view.module').then((m) => m.ViewModule) },
  { path: 'create', canActivate: [HasNoBuildGuard], loadChildren: () => import('./modules/create/create.module').then((m) => m.CreateModule) },
  { path: '**', pathMatch: 'full', redirectTo: 'build' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }