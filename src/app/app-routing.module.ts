import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [
  { path: 'build', loadChildren: () => import('./modules/build/build.module').then((m) => m.BuildModule) },
  { path: 'view', loadChildren: () => import('./modules/view/view.module').then((m) => m.ViewModule) },
  { path: '**', pathMatch: 'full', redirectTo: 'build' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }