import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CreateBuildComponent } from './component/create-build/create-build.component';

const routes: Routes = [
    {
        path: '', component: CreateBuildComponent
    }
];

@NgModule({
    providers: [],
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CreateRoutingModule { }
