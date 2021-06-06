import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SlormloaderComponent } from './slormloader/slormloader.component';

const routes: Routes = [
  { path: 'slormloader', component: SlormloaderComponent },
  { path: '**', redirectTo: 'slormloader' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
