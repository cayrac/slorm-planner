import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ViewCharacterComponent } from './component/view-character/view-character.component';
import { CharacterPasteLoad } from './resolver/character-paste-load.resolver';

const routes: Routes = [
    {
        path: ':key', component: ViewCharacterComponent, resolve: { character: CharacterPasteLoad }
    }
];

@NgModule({
    providers: [CharacterPasteLoad],
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ViewRoutingModule { }
