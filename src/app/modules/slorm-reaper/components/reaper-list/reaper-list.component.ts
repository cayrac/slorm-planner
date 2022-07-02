import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AbstractUnsubscribeComponent } from '@shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { ClipboardService } from '@shared/services/clipboard.service';
import { MessageService } from '@shared/services/message.service';
import { SearchService } from '@shared/services/search.service';
import { HeroClass } from '@slormancer/model/content/enum/hero-class';
import { Reaper } from '@slormancer/model/content/reaper';
import { SlormancerDataService } from '@slormancer/services/content/slormancer-data.service';
import { SlormancerReaperService } from '@slormancer/services/content/slormancer-reaper.service';
import { toBlob } from 'html-to-image';
import { combineLatest, takeUntil } from 'rxjs';

@Component({
  selector: 'app-reaper-list',
  templateUrl: './reaper-list.component.html',
  styleUrls: ['./reaper-list.component.scss']
})
export class ReaperListComponent extends AbstractUnsubscribeComponent implements OnInit {

    public readonly HERO_CLASSES = [HeroClass.Warrior, HeroClass.Huntress, HeroClass.Mage];

    public allReapers: Array<Reaper> = [];

    public filteredReapers: Array<Reaper> = [];

    public heroClass: HeroClass = HeroClass.Huntress;
    public primordial: boolean = false;

    public readonly form = new FormGroup({
        search: new FormControl(''),
        heroClass: new FormControl(HeroClass.Huntress),
        primordial: new FormControl(false),
        maxLevel: new FormControl(false)
    });

    constructor(private slormancerDataService: SlormancerDataService,
                private searchService: SearchService,
                private slormancerReaperService: SlormancerReaperService,
                private messageService: MessageService,
                private clipboardService: ClipboardService) {
        super();

        const search = this.form.get('search');
        if (search !== null) {
            search.valueChanges.subscribe(value => this.searchService.setSearch(value));
        }

        const heroClass = this.form.get('heroClass');
        const primordial = this.form.get('primordial');
        const maxLevel = this.form.get('maxLevel');
        if (heroClass !== null && primordial !== null && maxLevel !== null) {
            combineLatest([ heroClass.valueChanges, primordial.valueChanges, maxLevel.valueChanges ])
            .subscribe(([heroClass, primordial, maxLevel]) => this.buildReaperList(heroClass, primordial, maxLevel));
        }

        this.searchService.searchChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.filterReaperList());
    }

    public ngOnInit() {
        this.form.patchValue({
            search: '',
            heroClass: HeroClass.Huntress,
            primordial: false,
            maxLevel: false
        });
    }

    private buildReaperList(heroClass: HeroClass, primordial: boolean, maxLevel: boolean) {
        this.allReapers = this.slormancerDataService.getGameDataAvailableReaper()
            .map(reaperData => this.slormancerReaperService.getReaper(reaperData, heroClass, primordial, maxLevel ? reaperData.MAX_LVL : 1, maxLevel ? reaperData.MAX_LVL : 1, 0, 0, maxLevel ? 55 : 0));
            
        this.filterReaperList();
    }

    private filterReaperList() {
        this.filteredReapers = this.allReapers.filter(reaper => this.searchService.reaperMatchSearch(reaper));
    }

    public hasSearch(): boolean {
        return this.searchService.hasSearch();
    }

    public removeSearch() {
        this.form.patchValue({ search: '' });
    }

    public selectClass(heroClass: HeroClass) {
        this.form.patchValue({ heroClass });
    }

    public isSelectedClass(heroClass: HeroClass): boolean {
        const control = this.form.get('heroClass');
        return control !== null && control.value === heroClass;
    }

    public convert(reaperDom: HTMLElement) {
        toBlob(reaperDom).then(
            value => {
                const copySuccess = value !== null && this.clipboardService.copyImageToClipboard(value);

                if (copySuccess) {
                    this.messageService.message('Reaper image copied to clipboard');
                } else {
                    this.messageService.error('Failed to copy reaper image to clipboard');
                }
            },
            () => this.messageService.error('Failed to copy reaper image to clipboard')
        )
    }

    public isNotAvailable(reaper: Reaper): boolean {
        return reaper.id === 53;
    }

}
