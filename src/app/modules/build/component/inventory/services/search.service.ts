import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AncestralLegacy } from '../../../../slormancer/model/content/ancestral-legacy';
import { EquipableItem } from '../../../../slormancer/model/content/equipable-item';
import { SkillUpgrade } from '../../../../slormancer/model/content/skill-upgrade';
import { isNotNullOrUndefined } from '../../../../slormancer/util/utils';

@Injectable()
export class SearchService {

    private search: string | null = null;

    public readonly searchChanged = new BehaviorSubject<string |null>(null);

    constructor() { }

    public hasSearch(): boolean {
        return this.search !== null;
    }

    public setSearch(value: string | null) {
        value = value === null ? null : value.toLowerCase().trim();
        this.search = value !== null ? (value.length > 0 ? value : null) : null;
        this.searchChanged.next(this.search);
    }

    private stringsMatchSearch(values: Array<string | null>): boolean {
        let result = true;

        const search = this.search;
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
            ...item.affixes.map(affix => [ affix.isPure ? 'pure': null, affix.valueLabel + affix.statLabel ]).flat(),
            item.legendaryEffect === null ? null : item.legendaryEffect.description,
            item.reaperEnchantment !== null ? item.reaperEnchantment.label : null,
            item.skillEnchantment !== null ? item.skillEnchantment.label : null,
            item.attributeEnchantment !== null ? item.attributeEnchantment.label : null
        ]);
    }
    
    public upgradeMatchSearch(upgrade: SkillUpgrade): boolean {
        return this.stringsMatchSearch([
            upgrade.name,
            upgrade.type,
            upgrade.description,
            ...upgrade.genres,
            upgrade.genresLabel,
            upgrade.costLabel,
            upgrade.costType,
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
            ancestralLegacy.description,
            ...ancestralLegacy.relatedBuffs.map(buff => buff.name),
            ...ancestralLegacy.relatedMechanics.map(mechanic => mechanic.name),
            ...ancestralLegacy.types
        ]);
    }
}