import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AncestralLegacy } from '../../../../slormancer/model/content/ancestral-legacy';
import { EquipableItem } from '../../../../slormancer/model/content/equipable-item';
import { SkillUpgrade } from '../../../../slormancer/model/content/skill-upgrade';
import { Trait } from '../../../../slormancer/model/content/trait';
import { isNotNullOrUndefined } from '../../../../slormancer/util/utils';

@Injectable()
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
            item.legendaryEffect === null ? null : this.removeHtmlTags(item.legendaryEffect.description),
            item.reaperEnchantment !== null ? item.reaperEnchantment.label : null,
            item.skillEnchantment !== null ? item.skillEnchantment.label : null,
            item.attributeEnchantment !== null ? item.attributeEnchantment.label : null
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
            ancestralLegacy.genresLabel
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