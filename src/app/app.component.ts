import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { MinMax, Rarity } from 'slormancer-api';
import { CustomSlormancerItemValueService } from './custom-slormancer-item-value.service';


const belt_raw_damage: MinMax[] = [
    { min: 0, max: 0 }, // 0
    { min: 6, max: 9 }, // 1
    { min: 8, max: 12 }, // 2
    { min: 10, max: 14 }, // 3
    { min: 12, max: 17 }, // 4
    { min: 14, max: 20 }, // 5
    { min: 16, max: 23 }, // 6
    { min: 18, max: 26 }, // 7
    { min: 20, max: 29 }, // 8
    { min: 23, max: 33 }, // 9
    { min: 25, max: 36 }, // 10
    { min: 28, max: 40 }, // 11
    { min: 31, max: 44 }, // 12
    { min: 34, max: 48 }, // 13
    { min: 37, max: 53 }, // 14
    { min: 40, max: 57 }, // 15
    { min: 43, max: 62 }, // 16
    { min: 47, max: 67 }, // 17
    { min: 50, max: 72 }, // 18
    { min: 54, max: 77 }, // 19
    { min: 58, max: 83 }, // 20
    { min: 62, max: 88 }, // 21
    { min: 66, max: 94 }, // 22
    { min: 70, max: 100 }, // 23
    { min: 74, max: 106 }, // 24
    { min: 78, max: 112 }, // 25
    { min: 83, max: 118 }, // 26
    { min: 87, max: 125 }, // 27
    { min: 92, max: 132 }, // 28
    { min: 97, max: 139 }, // 29
    { min: 102, max: 146 }, // 30
    { min: 107, max: 153 }, // 31
    { min: 112, max: 160 }, // 32
    { min: 117, max: 168 }, // 33
    { min: 123, max: 176 }, // 34
    { min: 128, max: 183 }, // 35
    { min: 134, max: 191 }, // 36
    { min: 140, max: 200 }, // 37
    { min: 146, max: 208 }, // 38
    { min: 152, max: 217 }, // 39
    { min: 158, max: 225 }, // 40
    { min: 164, max: 234 }, // 41
    { min: 170, max: 243 }, // 42
    { min: 177, max: 253 }, // 43
    { min: 183, max: 262 }, // 44
    { min: 190, max: 272 }, // 45
    { min: 197, max: 281 }, // 46
    { min: 204, max: 291 }, // 47
    { min: 211, max: 301 }, // 48
    { min: 218, max: 312 }, // 49
    { min: 225, max: 322 }, // 50
    { min: 233, max: 333 }, // 51
    { min: 240, max: 343 }, // 52
    { min: 248, max: 354 }, // 53
    { min: 256, max: 365 }, // 54
    { min: 264, max: 377 }, // 55
    { min: 272, max: 388 }, // 56
    { min: 280, max: 400 }, // 57
    { min: 288, max: 411 }, // 58
    { min: 296, max: 423 }, // 59
    { min: 305, max: 435 }, // 60
    { min: 313, max: 448 }, // 61
    { min: 322, max: 460 }, // 62
    { min: 331, max: 473 }, // 63
    { min: 340, max: 485 }, // 64
    { min: 349, max: 498 }, // 65
    { min: 358, max: 512 }, // 66
    { min: 367, max: 525 }, // 67
    { min: 377, max: 538 }, // 68
    { min: 386, max: 552 }, // 69
    { min: 396, max: 566 }, // 70
    { min: 406, max: 580 }, // 71
    { min: 416, max: 594 }, // 72
    { min: 426, max: 608 }, // 73
    { min: 436, max: 622 }, // 74
    { min: 446, max: 637 }, // 75
    { min: 456, max: 652 }, // 76
    { min: 467, max: 667 }, // 77
    { min: 477, max: 682 }, // 78
    { min: 488, max: 697 }, // 79
    { min: 499, max: 713 }, // 80
]

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    public result = '';

    constructor(private router: Router, private titleService: Title, private slormancerItemValueService: CustomSlormancerItemValueService) {
        this.updateTitleOnRouteChange();

        // changer en +X -X avec couleur
        for (let level = 1 ; level <= 80 ; level++ ) {
            const expected = belt_raw_damage[level] as MinMax;
            const values = this.slormancerItemValueService.getAffixValues(level, 0, 7, false, Rarity.Normal, null);
            const valueMin = values[0]?.value as number;
            const valueMax = values[values.length - 1]?.value as number;
            const minIncrease = expected.min - valueMin;
            const maxIncrease = expected.max - valueMax;
            console.log(minIncrease, Math.round(minIncrease * 100) / 100, maxIncrease)
            this.result += ('Level ' + level + ': ').padEnd(10, ' ')
                + valueMin.toString().padStart(4, ' ') + ' - '
                + valueMax.toString().padEnd(4, ' ') + ' <=> '
                + expected.min.toString().padStart(4, ' ') + ' - '
                + expected.max.toString().padEnd(4, ' ') + ' | '
                + 'Increase : '
                + minIncrease.toString().padStart(7, ' ') + ' - '
                + maxIncrease.toString().padEnd(7, ' ')
                + "\n";
        }
    }

    private updateTitleOnRouteChange() {
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                const title = this.getFirstDataTitle(this.router.routerState.snapshot.root);

                if (title !== null) {
                    this.titleService.setTitle(title);
                }
            });
    }

    private getFirstDataTitle(route: ActivatedRouteSnapshot | null): string | null {
        let title: string | null = null;

        while (title === null && route !== null) {
            if (route.data && typeof route.data['title'] === 'string') {
                title = route.data['title'];
            }

            route = route.firstChild;
        }

        return title;
    }
}
