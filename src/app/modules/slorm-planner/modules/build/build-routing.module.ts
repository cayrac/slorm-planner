import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BuildComponent } from './build.component';
import { AncestralLegaciesComponent } from './component/ancestral-legacies/ancestral-legacies.component';
import { AttributesComponent } from './component/attributes/attributes.component';
import { CompareComponent } from './component/compare/compare.component';
import { ConfigComponent } from './component/config/config.component';
import { InventoryComponent } from './component/inventory/inventory.component';
import { SkillsComponent } from './component/skills/skills.component';
import { StatsComponent } from './component/stats/stats.component';


const routes: Routes = [
    {
        path: '',
        component: BuildComponent,
        children: [
            { path: 'inventory', component: InventoryComponent },
            { path: 'skills', component: SkillsComponent },
            { path: 'ancestral-legacies', component: AncestralLegaciesComponent },
            { path: 'attributes', component: AttributesComponent },
            { path: 'stats', component: StatsComponent },
            { path: 'config', component: ConfigComponent },
            { path: 'compare', component: CompareComponent },
            { path: '**', redirectTo: 'inventory' }
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuildRoutingModule { }
