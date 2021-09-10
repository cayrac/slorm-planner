import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'project';
    
  @HostListener('contextmenu', ['$event'])
  public onRightClick(event: MouseEvent) {
      event.preventDefault();
  }
}
