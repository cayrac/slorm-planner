import { Injectable } from '@angular/core';

import { Affix } from '../../model/content/affix';
import { AttributeEnchantment } from '../../model/content/attribute-enchantment';
import { Attribute } from '../../model/content/enum/attribute';
import { EquipableItemBase } from '../../model/content/enum/equipable-item-base';
import { HeroClass } from '../../model/content/enum/hero-class';
import { ALL_RARITIES, Rarity } from '../../model/content/enum/rarity';
import { ReaperSmith } from '../../model/content/enum/reaper-smith';
import { EquipableItem } from '../../model/content/equipable-item';
import { GameDataStat } from '../../model/content/game/data/game-data-stat';
import { LegendaryEffect } from '../../model/content/legendary-effect';
import { ReaperEnchantment } from '../../model/content/reaper-enchantment';
import { SkillEnchantment } from '../../model/content/skill-enchantment';
import { BinaryParseReport } from '../../model/export/binary-parse-report';
import { Bits } from '../../model/export/bits';
import { compareVersions } from '../../util';
import { binaryToBoolean, binaryToNumber, booleanToBinary, numberToBinary, takeBitsChunk } from '../../util/bits.util';
import { SlormancerAffixService } from '../content/slormancer-affix.service';
import { SlormancerDataService } from '../content/slormancer-data.service';
import { SlormancerItemService } from '../content/slormancer-item.service';
import { SlormancerLegendaryEffectService } from '../content/slormancer-legendary-effect.service';

@Injectable()
export class SlormancerBinaryItemService {
    
    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerItemAffixService: SlormancerAffixService,
                private slormancerLegendaryEffectService: SlormancerLegendaryEffectService,
                private slormancerItemService: SlormancerItemService) { }

    
    private affixToBinary(affix: Affix): Bits {
        const result: Bits = [];
        result.push(...numberToBinary(ALL_RARITIES.indexOf(affix.rarity), 3));
        const affixStat = this.slormancerDataService.getGameDataStatByRef(affix.craftedEffect.effect.stat)
        result.push(...numberToBinary(affixStat === null ? 0 : affixStat.REF_NB, 9));
        result.push(...numberToBinary(affix.craftedEffect.craftedValue, 9));
        result.push(...booleanToBinary(affix.isPure));
        if (affix.isPure) {
            result.push(...numberToBinary(affix.pure, 8));
        }
        return result;
    }

    private binaryToAffix(binary: Bits, level: number, reinforcment: number): Affix {
        const rarityValue = binaryToNumber(takeBitsChunk(binary, 3));
        const statValue = binaryToNumber(takeBitsChunk(binary, 9));
        const craftedValue = binaryToNumber(takeBitsChunk(binary, 9));
        const isPure = binaryToBoolean(takeBitsChunk(binary, 1));
        const pure = isPure ? binaryToNumber(takeBitsChunk(binary, 8)) : 100;

        const rarity: Rarity | undefined = ALL_RARITIES[rarityValue];
        const stat: GameDataStat | null = this.slormancerDataService.getGameDataStatByRefId(statValue);

        if (rarity === undefined || stat === null) {
            throw new Error('Failed to parse affix from binary : ' + binary.join());
        }

        const affix = this.slormancerItemAffixService.getAffixFromStat(stat.REF, level, reinforcment, rarity, craftedValue, pure);

        if (affix === null) {
            throw new Error('Failed to parse affix from binary : ' + binary.join());
        }

        return affix;
    }


    public itemToBinary(item: EquipableItem): Bits {
        let result: Bits = [];

        result.push(...numberToBinary(item.level, 7));
        result.push(...numberToBinary(item.reinforcment, 8));
        if (item.level > 100) {
            result.push(...numberToBinary(item.grafts, 4));
        }

        result.push(...numberToBinary(item.affixes.length, 4));

        for (const affix of item.affixes) {
            result.push(...this.affixToBinary(affix));
        }

        const attribute = item.attributeEnchantment;
        result.push(...numberToBinary(attribute !== null ? attribute.craftedAttribute + 1 : 0, 4));
        result.push(...numberToBinary(attribute !== null ? attribute.craftedValue : 0, 2));

        const reaper = item.reaperEnchantment;
        result.push(...numberToBinary(reaper !== null ? reaper.craftedReaperSmith + 1 : 0, 4));
        result.push(...numberToBinary(reaper !== null ? reaper.craftedValue : 0, 3));

        const skill = item.skillEnchantment;
        result.push(...numberToBinary(skill !== null ? skill.craftedSkill + 1 : 0, 4));
        result.push(...numberToBinary(skill !== null ? skill.craftedValue : 0, 3));

        const legendary = item.legendaryEffect;
        result.push(...numberToBinary(legendary !== null ? legendary.id + 1 : 0, 10));
        result.push(...numberToBinary(legendary !== null ? legendary.value : 0, 8));
        
        return result;
    }

    public binaryToItem(binary: Bits, base: EquipableItemBase, heroClass: HeroClass, version: string, report: BinaryParseReport): EquipableItem {
        
        const has6BitsLevel = compareVersions(version, '0.4.1') < 0;
        const hasGrafts = compareVersions(version, '0.7.0') > 0;
        let level = binaryToNumber(takeBitsChunk(binary, has6BitsLevel ? 6 : 7));

        if (has6BitsLevel && level <= 16) {
            level += 64;
            report.fromCorrupted = true;
        }

        const reinforcment = binaryToNumber(takeBitsChunk(binary, 8));
        let grafts = 0;
        if (hasGrafts && level > 100) {
            grafts = binaryToNumber(takeBitsChunk(binary, 4));
        }

        const affixCount = binaryToNumber(takeBitsChunk(binary, 4));
        const affixes: Array<Affix> = [];
        for (let i = 0 ; i < affixCount ; i++) {
            affixes.push(this.binaryToAffix(binary, level, reinforcment));
        }

        const attributeType = binaryToNumber(takeBitsChunk(binary, 4));
        const attributeValue = binaryToNumber(takeBitsChunk(binary, 2));
        let attribute: AttributeEnchantment | null = null;
        if (attributeType > 0) {
            attribute = this.slormancerItemService.getAttributeEnchantment(<Attribute>attributeType - 1, attributeValue);
        }

        const reaperType = binaryToNumber(takeBitsChunk(binary, 4));
        const reaperValue = binaryToNumber(takeBitsChunk(binary, 3));
        let reaper: ReaperEnchantment | null = null;
        if (reaperType > 0) {
            reaper = this.slormancerItemService.getReaperEnchantment(<ReaperSmith>reaperType - 1, reaperValue);
        }

        const skillType = binaryToNumber(takeBitsChunk(binary, 4));
        const skillValue = binaryToNumber(takeBitsChunk(binary, 3));
        let skill: SkillEnchantment |null = null;
        if (skillType > 0) {
            skill = this.slormancerItemService.getSkillEnchantment(skillType - 1, skillValue);
        }

        const legendaryId = binaryToNumber(takeBitsChunk(binary, 10));
        const legendaryValue = binaryToNumber(takeBitsChunk(binary, 8));
        let legendary: LegendaryEffect |null = null;
        if (legendaryId > 0) {
            legendary = this.slormancerLegendaryEffectService.getLegendaryEffectById(legendaryId - 1, legendaryValue, reinforcment, heroClass);
        }

        return this.slormancerItemService.getEquipableItem(base, heroClass, level, affixes, reinforcment, grafts, legendary, reaper, skill, attribute, 0);
    }
}