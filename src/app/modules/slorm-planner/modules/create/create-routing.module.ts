import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CreateFirstBuildComponent } from './component/create-first-build/create-first-build.component';

const routes: Routes = [
    {
        path: '', component: CreateFirstBuildComponent
    }
];

@NgModule({
    providers: [],
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CreateRoutingModule { }
