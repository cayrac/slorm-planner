import { Component } from '@angular/core';
import { SlormancerTranslateService } from '@slorm-api';

@Component({
    selector: 'app-slorm-tools',
    templateUrl: './slorm-tools.component.html',
    styleUrls: ['./slorm-tools.component.scss']
})
export class SlormToolsComponent {

    public readonly TOOLS: Array<{ link: string, icon: string, name: string, info: string, action: string }> = [
        { 
            link: '/slorm-planner',
            icon: 'assets/img/character/icon/1/head.png',
            name: 'Slorm Planner',
            info: 'A tool made for loading, testing and sharing builds',
            action: 'Load Slorm Planner'
        },
        {
            link: '/slorm-reaper',
            icon: 'assets/img/reaper/0/0.png',
            name: 'Slorm reapers',
            info: 'A list of all available slorm reapers (beware of spoilers)',
            action: 'Load Slorm Reapers'
        }
    ];

    private readonly TIPS = [
        'tip_1',
        'tip_2',
        'tip_3',
        'tip_4',
        'tip_5',
        'tip_6',
        'This game isn\'t about cacti, even if cacti are fun',
        'tip_8',
        'tip_9',
        'tip_10',
        'tip_11',
        'tip_12',
        'tip_13',
    ].map(tip => this.slormancerTranslateService.translate(tip));

    private readonly JOKES = [
        'There is no cow level',
        'Multiplayer is not available',
        'Do not forget to add a :thumbsup: and :thumbdsown: emote to your suggestions on discord',
    ]

    private mcRippedClicks = 0;

    public dialog = 'Hello champion, how may i help you ?';

    constructor(private slormancerTranslateService: SlormancerTranslateService) {}

    public newMcRippedDialog() {
        this.mcRippedClicks++;

        let tips: Array<string> = [];

        if (this.mcRippedClicks === 1) {
            tips.push('Please choose one of the available tools below');
        } else if (this.mcRippedClicks === 2) {
            tips.push('I do not have more informations for you, more clicks will definitely not help');
        } else {
            tips.push(...this.TIPS);

            if (this.mcRippedClicks > 6) {
                tips.push(...this.JOKES);
            }
        }


        this.dialog = tips[Math.floor(Math.random() * tips.length)] as string;
    }
}
