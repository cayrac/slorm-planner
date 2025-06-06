import { Component } from '@angular/core';
import { GAME_LINK, GITHUB_PROJECT_LINK } from '@shared/constants';

import { environment } from '../../../../../../../environments/environment';

@Component({
  selector: 'app-view-sidenav',
  templateUrl: './view-sidenav.component.html',
  styleUrls: ['./view-sidenav.component.scss']
})
export class ViewSidenavComponent {

    public readonly SHORTCUTS: Array<{ link: string, icon: string, label: string }> = [
        { link: '/slorm-reaper', icon: 'assets/img/reaper/0/0.png', label: 'Slorm reapers' },
        { link: '/slorm-legendary', icon: 'assets/img/icon/item/ring/adventure.png', label: 'Slorm legendaries' }
    ];

    public readonly VERSION = environment.version;

    public readonly GITHUB_PROJECT_LINK = GITHUB_PROJECT_LINK;

    public readonly GAME_LINK = GAME_LINK;

    constructor() { }
}
