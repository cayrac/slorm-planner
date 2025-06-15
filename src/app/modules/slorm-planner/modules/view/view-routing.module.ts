import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CharacterPathResolver } from './resolver/character-path.resolver';
import { ViewLayoutComponent } from './component/view-layout/view-layout.component';

const routes: Routes = [
    { path: 'build/:key', component: ViewLayoutComponent, resolve: { sharedData: CharacterPathResolver } }
];

@NgModule({
    providers: [
        CharacterPathResolver
    ],
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ViewRoutingModule { }
