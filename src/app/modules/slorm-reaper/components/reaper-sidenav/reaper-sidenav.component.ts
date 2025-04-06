import { Component } from '@angular/core';
import { GAME_LINK, GITHUB_PROJECT_LINK } from '@shared/constants';

import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-reaper-sidenav',
  templateUrl: './reaper-sidenav.component.html',
  styleUrls: ['./reaper-sidenav.component.scss']
})
export class ReaperSidenavComponent {

    public readonly SHORTCUTS: Array<{ link: string, icon: string, label: string }> = [
        { link: '/slorm-planner', icon: 'assets/img/character/icon/1/head.png', label: 'Slorm planner' },
        { link: '/slorm-legendary', icon: 'assets/img/icon/item/ring/adventure.png', label: 'Slorm legendaries' }
    ];

    public readonly VERSION = environment.version;

    public readonly GITHUB_PROJECT_LINK = GITHUB_PROJECT_LINK;

    public readonly GAME_LINK = GAME_LINK;

    constructor() { }
}
