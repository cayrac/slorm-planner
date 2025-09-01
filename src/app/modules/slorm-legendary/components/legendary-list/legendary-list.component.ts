import { Component, OnInit, TrackByFunction } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AbstractUnsubscribeComponent } from '@shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { SelectOption } from '@shared/model/select-option';
import { ClipboardService } from '@shared/services/clipboard.service';
import { MessageService } from '@shared/services/message.service';
import { SearchService } from '@shared/services/search.service';
import {
    compareString,
    EQUIPABLE_ITEM_BASE_VALUES,
    EquipableItem,
    EquipableItemBase,
    GameDataLegendary,
    HeroClass,
    isNotNullOrUndefined,
    Reaper,
    SlormancerDataService,
    SlormancerEffectValueService,
    SlormancerItemService,
    SlormancerLegendaryEffectService,
    SlormancerTranslateService
} from '@slorm-api';
import { toBlob } from 'html-to-image';
import { takeUntil } from 'rxjs';

interface LegendaryListForm {
    search: FormControl<string>;
    heroClasses: FormControl<HeroClass[]>;
    bases: FormControl<EquipableItemBase[]>;
    maxReinforcement: FormControl<boolean>;
}

@Component({
  selector: 'app-legendary-list',
  templateUrl: './legendary-list.component.html',
  styleUrls: ['./legendary-list.component.scss']
})
export class LegendaryListComponent extends AbstractUnsubscribeComponent implements OnInit {

    public readonly HERO_CLASSES = [HeroClass.Warrior, HeroClass.Huntress, HeroClass.Mage];
    public readonly baseOptions: SelectOption<EquipableItemBase>[];

    public readonly classSpecificLabels: { [key in HeroClass]: string };

    public allLegendaries: Array<EquipableItem> = [];

    public filteredLegendaries: Array<EquipableItem> = [];

    public readonly form = new FormGroup<LegendaryListForm>({
        search: new FormControl<string>('', { nonNullable: true }),
        heroClasses: new FormControl<HeroClass[]>([], { nonNullable: true }),
        bases: new FormControl<EquipableItemBase[]>([], { nonNullable: true }),
        maxReinforcement: new FormControl<boolean>(false, { nonNullable: true }),
    });

    public readonly trackLegendary: TrackByFunction<EquipableItem> = (index, item) => item.legendaryEffect?.id;

    constructor(private slormancerDataService: SlormancerDataService,
                private searchService: SearchService,
                private slormancerLegendaryEffectService: SlormancerLegendaryEffectService,
                private slormancerItemService: SlormancerItemService,
                private slormancerEffectValueService: SlormancerEffectValueService,
                private messageService: MessageService,
                private clipboardService: ClipboardService,
                private slormancerTranslateService: SlormancerTranslateService) {
        super();

        this.form.controls.search.valueChanges.subscribe(value => this.searchService.setSearch(value));

        this.buildLegendaryList();

        this.form.controls.maxReinforcement.valueChanges
            .subscribe(maxReinforcement => this.updateLegendaryEffects(maxReinforcement));
        this.form.controls.heroClasses.valueChanges
            .subscribe(() => this.filterLegendaryList());
        this.form.controls.bases.valueChanges
            .subscribe(() => this.filterLegendaryList());

        this.baseOptions = EQUIPABLE_ITEM_BASE_VALUES.map(base =>({
            label: this.slormancerTranslateService.translate('PIECE_' + base).split('(')[0] ?? base,
            value: base
        }));

        this.classSpecificLabels = this.HERO_CLASSES.reduce(
            (result, heroClass) => ({ ...result, [heroClass]: 'Only available for ' + this.slormancerTranslateService.translate('hero_' + heroClass) }),
            {} as { [key in HeroClass]: string }
        );
    }

    public ngOnInit() {
        this.reset();

        this.searchService.searchChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.filterLegendaryList());
    }

    private buildLegendaryList() {
        this.allLegendaries = this.slormancerDataService.getGameDataAvailableLegendaries()
            .filter(legendaryData => legendaryData.REF !== 0)
            .sort((a, b) => compareString(a.LOCAL_NAME, b.LOCAL_NAME))
            .map(legendaryData => this.buildLegendaryItem(legendaryData))
            .filter(isNotNullOrUndefined);
            
        this.filterLegendaryList();
    }

    private updateLegendaryEffects(maxReinforcement: boolean) {
        for (const item of this.allLegendaries) {
            item.reinforcement = maxReinforcement ? 15 : 0;
            if (item.legendaryEffect !== null) {
                for(const effect of item.legendaryEffect.effects) {
                    effect.craftedValue = maxReinforcement ? effect.maxPossibleCraftedValue : effect.minPossibleCraftedValue;
                    this.slormancerEffectValueService.updateEffectValue(effect.effect, item.reinforcement);
                } 
                this.slormancerLegendaryEffectService.updateLegendaryEffectModel(item.legendaryEffect);
            }
            this.slormancerItemService.updateEquipableItemModel(item, 0);
            this.slormancerItemService.updateEquipableItemView(item, 0);
        }
    }

    private buildLegendaryItem(legendaryData: GameDataLegendary, maxed: boolean = false): EquipableItem | null {
        let result: EquipableItem | null = null;
        const heroClass = [0, 1, 2].includes(legendaryData.HERO) ? legendaryData.HERO as HeroClass : HeroClass.Huntress;
        const legendaryEffect = this.slormancerLegendaryEffectService.getLegendaryEffectById(legendaryData.REF, 100, 0, heroClass);

        if (legendaryData !== null) {
            
            result = this.slormancerItemService.getEquipableItem(
                legendaryData.ITEM as EquipableItemBase,
                heroClass,
                100,
                [],
                maxed ? 15 : 0,
                0,
                legendaryEffect,
                null,
                null,
                null,
                0
            );
        }
        return result;
    }

    private filterLegendaryList() {
        const bases = this.form.controls.bases.value;
        const heroClasses = this.form.controls.heroClasses.value;
        this.filteredLegendaries = this.allLegendaries
            .filter(item => this.searchService.itemMatchSearch(item)
                && (bases.length === 0 || bases.includes(item.base))
                && (heroClasses.length === 0 || item.legendaryEffect !== null
                    && (item.legendaryEffect.classSpecific === null || heroClasses.includes(item.legendaryEffect.classSpecific))));
    }

    public reset() {
        this.form.reset({
            search: '',
            heroClasses: [],
            bases: [],
            maxReinforcement: false,
        });
    }

    public hasSearch(): boolean {
        return this.searchService.hasSearch();
    }

    public removeSearch() {
        this.form.patchValue({ search: '' });
    }

    public toggleClass(heroClass: HeroClass) {
        let heroClasses = this.form.controls.heroClasses.value;
        const index = heroClasses.indexOf(heroClass);

        if (index === -1) {
            heroClasses.push(heroClass);
        } else {
            heroClasses.splice(index, 1);
        }

        this.form.patchValue({ heroClasses });
    }

    public isSelectedClass(heroClass: HeroClass): boolean {
        return this.form.controls.heroClasses.value.includes(heroClass);
    }

    public copy(reaperDom: HTMLElement) {
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
        return false;
    }

    public isCopyable(): boolean {
        return this.clipboardService.canCopyImage();
    }

    public debug(item: EquipableItem) {
        console.log(item.legendaryEffect);
    }
}
