import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ViewCharacterComponent } from './component/view-character/view-character.component';
import { CharacterPathResolver } from './resolver/character-path.resolver';

const routes: Routes = [
    { path: 'build/:key', component: ViewCharacterComponent, resolve: { character: CharacterPathResolver } }
];

@NgModule({
    providers: [
        CharacterPathResolver
    ],
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ViewRoutingModule { }
