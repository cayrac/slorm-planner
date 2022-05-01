import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HasBuildGuard } from 'src/app/modules/slorm-planner/guard/has-build.guard';
import { HasNoBuildGuard } from 'src/app/modules/slorm-planner/guard/has-no-build.guard';

import { BuildModule } from './modules/build/build.module';
import { CreateModule } from './modules/create/create.module';
import { ViewModule } from './modules/view/view.module';


const routes: Routes = [
    { path: 'build', canActivate: [HasBuildGuard], loadChildren: () => BuildModule },
    { path: 'view', loadChildren: () => ViewModule },
    { path: 'create', canActivate: [HasNoBuildGuard], loadChildren: () => CreateModule },
    { path: '**', pathMatch: 'full', redirectTo: 'build' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    HasBuildGuard,
    HasNoBuildGuard
  ]
})
export class SlormPlannerRoutingModule { }
