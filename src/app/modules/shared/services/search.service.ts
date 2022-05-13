import { Injectable } from '@angular/core';
import { Activable } from '@slormancer/model/content/activable';
import { AncestralLegacy } from '@slormancer/model/content/ancestral-legacy';
import { EquipableItem } from '@slormancer/model/content/equipable-item';
import { Reaper } from '@slormancer/model/content/reaper';
import { SkillUpgrade } from '@slormancer/model/content/skill-upgrade';
import { Trait } from '@slormancer/model/content/trait';
import { isNotNullOrUndefined } from '@slormancer/util/utils';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchService {

    private search: string | null = null;

    private dom = document.createElement("div");

    public readonly searchChanged = new BehaviorSubject<string |null>(null);

    constructor() { }

    public hasSearch(): boolean {
        return this.search !== null;
    }

    public setSearch(value: string | null) {
        this.search = value !== null ? (value.length > 0 ? value : null) : null;
        this.searchChanged.next(this.search);
    }

    private getCleanSearchValue(): string | null {
        return this.search === null ? null : this.search.toLowerCase().trim();
    }

    private removeHtmlTags(value: string | null, classesToRemove: Array<string> = []): string | null{
        let result = value;

        if (result !== null) {
            this.dom.innerHTML = result.toLowerCase();
            if (classesToRemove.length > 0) {
                for (const classToRemove of classesToRemove) {
                    const items = this.dom.getElementsByClassName(classToRemove);
                    for (let i = 0, len = items.length; i < len ; i++) {
                        const item = items.item(i);
                        if (item) {
                            item.remove();
                        }
                    }
                }
            }
            result = this.dom.textContent;
        }


        return result;
    }

    private stringsMatchSearch(values: Array<string | null>): boolean {
        let result = true;

        const search = this.getCleanSearchValue();
        if (search !== null) {
            result = this.search === null ? true : values
                .find(value => isNotNullOrUndefined(value) && value.toLowerCase().indexOf(search) !== -1) !== undefined;
        }

        return result;
    }

    public itemMatchSearch(item: EquipableItem): boolean {
        return this.stringsMatchSearch([
            item.level.toString(),
            item.name,
            item.base,
            item.rarity,
            ...item.affixes.map(affix => [ affix.isPure ? 'pure': null, this.removeHtmlTags(affix.valueLabel + ' ' + affix.statLabel, ['details']) ]).flat(),
            item.legendaryEffect === null ? null : this.removeHtmlTags(item.legendaryEffect.description, ['details']),
            item.reaperEnchantment !== null ? this.removeHtmlTags(item.reaperEnchantment.label, ['details']) : null,
            item.skillEnchantment !== null ? this.removeHtmlTags(item.skillEnchantment.label, ['details']) : null,
            item.attributeEnchantment !== null ? this.removeHtmlTags(item.attributeEnchantment.label, ['details']) : null
        ]);
    }
    
    public upgradeMatchSearch(upgrade: SkillUpgrade): boolean {
        return this.stringsMatchSearch([
            upgrade.name,
            upgrade.type,
            this.removeHtmlTags(upgrade.description),
            ...upgrade.genres,
            upgrade.genresLabel,
            this.removeHtmlTags(upgrade.costLabel),
            this.removeHtmlTags(upgrade.costType),
            ...upgrade.relatedBuffs.map(buff => buff.name),
            ...upgrade.relatedClassMechanics.map(buff => buff.name),
            ...upgrade.relatedMechanics.map(buff => buff.name)
        ]);
    }   

    public ancestralLegacyMatchSearch(ancestralLegacy: AncestralLegacy): boolean {
        return this.stringsMatchSearch([
            ancestralLegacy.name,
            ancestralLegacy.costType,
            ...ancestralLegacy.genres,
            ancestralLegacy.isActivable ? 'activable' : null,
            this.removeHtmlTags(ancestralLegacy.description),
            ...ancestralLegacy.relatedBuffs.map(buff => buff.name),
            ...ancestralLegacy.relatedMechanics.map(mechanic => mechanic.name),
            ...ancestralLegacy.types,
            ancestralLegacy.typeLabel,
            ancestralLegacy.genresLabel,
            ancestralLegacy.costLabel
        ]);
    }

    public reaperMatchSearch(reaper: Reaper): boolean {
        return this.stringsMatchSearch([
            reaper.name,
            reaper.description,
            reaper.benediction,
            reaper.malediction,
            reaper.smith.name,
            reaper.smithLabel,
            reaper.victimsLabel,
            reaper.levelLabel,
            reaper.damageTypeLabel,
            reaper.benediction !== null ? reaper.benedictionTitleLabel : '',
            reaper.malediction !== null ? reaper.maledictionTitleLabel : '',
            reaper.activables.length !== 0 ? reaper.activablesTitleLabel : '',
            reaper.damagesLabel,
            reaper.maxDamagesWithBonusesLabel,
            reaper.lore,
        ]) || reaper.activables.some(activable => this.activableMatchSearch(activable));
    }

    public activableMatchSearch(activable: Activable): boolean {
        return this.stringsMatchSearch([
            activable.name,
            activable.genresLabel,
            activable.cooldownLabel,
            activable.costLabel,
            activable.description,
        ]);
    }

    public traitMatchSearch(trait: Trait): boolean {
        return this.stringsMatchSearch([
            trait.rankLabel,
            this.removeHtmlTags(trait.cumulativeStats),
            this.removeHtmlTags(trait.description),
            trait.traitLevelLabel,
        ]);
    }
}