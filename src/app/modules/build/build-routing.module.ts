import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BuildComponent } from './build.component';
import { AncestralLegaciesComponent } from './component/ancestral-legacies/ancestral-legacies.component';
import { InventoryComponent } from './component/inventory/inventory.component';
import { SkillsComponent } from './component/skills/skills.component';


const routes: Routes = [
    {
        path: '',
        component: BuildComponent,
        children: [
            { path: 'inventory', component: InventoryComponent },
            { path: 'skills', component: SkillsComponent },
            { path: 'ancestral-legacy', component: AncestralLegaciesComponent },
            { path: '**', redirectTo: 'inventory' }
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuildRoutingModule { }
