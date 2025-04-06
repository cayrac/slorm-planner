import { Component } from '@angular/core';
import { GAME_LINK, GITHUB_PROJECT_LINK } from '@shared/constants';

import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-legendary-sidenav',
  templateUrl: './legendary-sidenav.component.html',
  styleUrls: ['./legendary-sidenav.component.scss']
})
export class LegendarySidenavComponent {

    public readonly SHORTCUTS: Array<{ link: string, icon: string, label: string }> = [
        { link: '/slorm-planner', icon: 'assets/img/character/icon/1/head.png', label: 'Slorm planner' },
        { link: '/slorm-reaper', icon: 'assets/img/reaper/0/0.png', label: 'Slorm reapers' },
    ];

    public readonly VERSION = environment.version;

    public readonly GITHUB_PROJECT_LINK = GITHUB_PROJECT_LINK;

    public readonly GAME_LINK = GAME_LINK;

    constructor() { }
}
