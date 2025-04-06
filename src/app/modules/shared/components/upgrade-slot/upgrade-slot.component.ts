import { Component, HostListener, Input, OnInit } from '@angular/core';
import { SkillType, SkillUpgrade } from '@slorm-api';
import { takeUntil } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { SearchService } from '../../services/search.service';
import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';
import { ViewData, ViewModalComponent } from '../view-modal/view-modalcomponent';


@Component({
  selector: 'app-upgrade-slot',
  templateUrl: './upgrade-slot.component.html',
  styleUrls: ['./upgrade-slot.component.scss']
})
export class UpgradeSlotComponent extends AbstractUnsubscribeComponent implements OnInit {

    @Input()
    public readonly upgrade: SkillUpgrade | null = null;

    @Input()
    public readonly selected: boolean = false;

    @Input()
    public readonly equipped: boolean = false;

    @Input()
    public readonly overlay: boolean = false;

    @Input()
    public readonly readonly: boolean = false;

    public hiddenBySearch: boolean = false;

    public showOverlay = false;

    @HostListener('mouseenter')
    public onOver() {
        this.showOverlay = true;
    }

    @HostListener('mouseleave')
    public onLeave() {
        this.showOverlay = false;
    }

    constructor(private searchService: SearchService,
                private dialog: MatDialog
    ) {
        super();
    }

    public ngOnInit() {
        this.searchService.searchChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(search => this.hiddenBySearch = search !== null && this.upgrade !== null && !this.searchService.upgradeMatchSearch(this.upgrade))
    }

    public isPassive(upgrade: SkillUpgrade): boolean {
        return upgrade.type === SkillType.Passive;
    }
                                
    public showModalTooltip(event: MouseEvent, upgrade: SkillUpgrade) {
        let skip = false;

        if (event.ctrlKey && upgrade) {
            skip = true;
            event.stopPropagation();
            event.stopImmediatePropagation();
            const data: ViewData = { entity: { upgrade } };
            this.dialog.open(ViewModalComponent, { data });
        }

        return skip;
    }
}
    
