import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ViewCharacterComponent } from './component/view-character/view-character.component';
import { CharacterOnlinePasteResolver } from './resolver/character-online-paste.resolver';
import { CharacterPathResolver } from './resolver/character-path.resolver';

const routes: Routes = [
    { path: 'build/:key', component: ViewCharacterComponent, resolve: { character: CharacterPathResolver } },
    { path: ':key/:name', component: ViewCharacterComponent, resolve: { character: CharacterOnlinePasteResolver } },
    { path: ':key', component: ViewCharacterComponent, resolve: { character: CharacterOnlinePasteResolver } },
];

@NgModule({
    providers: [
        CharacterPathResolver,
        CharacterOnlinePasteResolver
    ],
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ViewRoutingModule { }
