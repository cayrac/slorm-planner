import { Component } from '@angular/core';

import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-reaper-sidenav',
  templateUrl: './reaper-sidenav.component.html',
  styleUrls: ['./reaper-sidenav.component.scss']
})
export class ReaperSidenavComponent {

    public readonly SHORTCUTS: Array<{ link: string, icon: string, label: string }> = [
        { link: '/slorm-planner', icon: 'assets/img/character/icon/1/head.png', label: 'Slorm planner' }
    ];

    public readonly VERSION = environment.version;

    public readonly GITHUB_LINK = environment.githublink;

    public readonly GAME_LINK = environment.gameLink;

    constructor() { }
}
