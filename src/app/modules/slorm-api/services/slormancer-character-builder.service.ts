import { Injectable } from '@angular/core';

import { HeroClass } from '..//model/content/enum/hero-class';
import { GAME_VERSION, INVENTORY_SIZE, MAX_HERO_LEVEL, STASH_SIZE, STASH_TABS_COUNT, UNITY_REAPERS } from '../constants/common';
import { CharacterConfig } from '../model';
import { Character, CharacterGear, CharacterSkillAndUpgrades } from '../model/character';
import { Activable } from '../model/content/activable';
import { AncestralLegacy } from '../model/content/ancestral-legacy';
import { Attribute } from '../model/content/enum/attribute';
import { ReaperSmith } from '../model/content/enum/reaper-smith';
import { EquipableItem } from '../model/content/equipable-item';
import { Reaper } from '../model/content/reaper';
import { ActivationRune, EffectRune, EnhancementRune } from '../model/content/rune';
import { RuneType } from '../model/content/rune-type';
import { Skill } from '../model/content/skill';
import { Ultimatum } from '../model/content/ultimatum';
import { GameItem } from '../model/parser/game/game-item';
import { GameSave, GameSharedInventory, GameUltimatum } from '../model/parser/game/game-save';
import { RunesCombination } from '../model/runes-combination';
import { list } from '../util/math.util';
import { getOlorinUltimatumBonusLevel, isNotNullOrUndefined, valueOrDefault, valueOrNull } from '../util/utils';
import { SlormancerAncestralLegacyNodesService } from './content';
import { SlormancerAncestralLegacyService } from './content/slormancer-ancestral-legacy.service';
import { SlormancerAttributeService } from './content/slormancer-attribute.service';
import { SlormancerDataService } from './content/slormancer-data.service';
import { SlormancerItemService } from './content/slormancer-item.service';
import { SlormancerReaperService } from './content/slormancer-reaper.service';
import { SlormancerRuneService } from './content/slormancer-rune.service';
import { SlormancerSkillService } from './content/slormancer-skill.service';
import { SlormancerUltimatumService } from './content/slormancer-ultimatum.service';

@Injectable()
export class SlormancerCharacterBuilderService {

    constructor(private slormancerItemservice: SlormancerItemService,
                private slormancerReaperService: SlormancerReaperService,
                private slormancerDataService: SlormancerDataService,
                private slormancerRuneService: SlormancerRuneService,
                private slormancerSkillService: SlormancerSkillService,
                private slormancerAttributeService: SlormancerAttributeService,
                private slormancerAncestralLegacyService: SlormancerAncestralLegacyService,
                private slormancerUltimatumService: SlormancerUltimatumService,
                private slormancerAncestralLegacyNodesService: SlormancerAncestralLegacyNodesService
        ) { }

    private getSkills(heroClass: HeroClass, equipped: Array<number> = [], ranks: Array<number> = []): Array<CharacterSkillAndUpgrades> {
        return this.slormancerDataService.getGameDataActiveSkills(heroClass).map(gameData => {
            const skill = this.slormancerSkillService.getHeroSkill(gameData.REF, heroClass, Math.min(15, valueOrDefault(ranks[gameData.REF], 0)));
            const upgrades = this.slormancerDataService.getGameDataUpgradeIdsForSkill(gameData.REF, heroClass)
                .map(upgradeId => this.slormancerSkillService.getUpgrade(upgradeId, heroClass, valueOrDefault(ranks[upgradeId], 0)))
                .filter(isNotNullOrUndefined);
            return skill === null ? null : {
                skill,
                upgrades,
                selectedUpgrades: upgrades.map(passive => passive.id).filter(id => equipped[id] === 1),
                activeUpgrades: [],
                stats: [],
                investedSlorm: 0,
            } as CharacterSkillAndUpgrades
        }).filter(isNotNullOrUndefined);
    }

    private getSkillsClone(skillAndUpgrades: CharacterSkillAndUpgrades): CharacterSkillAndUpgrades {
        return {
            skill: this.slormancerSkillService.getHeroSkillClone(skillAndUpgrades.skill),
            selectedUpgrades: [...skillAndUpgrades.selectedUpgrades],
            activeUpgrades: [...skillAndUpgrades.activeUpgrades],
            upgrades: skillAndUpgrades.upgrades.map(upgrade => this.slormancerSkillService.getUpgradeClone(upgrade)),
            stats: [...skillAndUpgrades.stats],
        };
    }

    private getItem(item: GameItem | null, heroClass: HeroClass): EquipableItem | null {
        let result: EquipableItem | null = null;

        if (this.slormancerItemservice.isEquipableItem(item)) {
            result = this.slormancerItemservice.getEquipableItemFromGame(item, heroClass, 0);
        }

        return result;
    }

    private getEquippedReaper(save: GameSave, heroClass: HeroClass): Reaper {
        const reaperCount = this.slormancerDataService.getGameDataReaperCount();
        let reaper: Reaper | null = null;

        const weaponEquip = save.weapon_equip[heroClass];
        const primordial = weaponEquip >= reaperCount;
        const reaperId = weaponEquip % reaperCount;
        const reaperData = valueOrNull(save.weapon_data[heroClass][reaperId]);

        const reaperMastery = this.slormancerReaperService.getReaperMastery(save.weapon_data[heroClass])

        if (reaperData !== null) {
            reaper = this.slormancerReaperService.getReaperFromGameWeapon(reaperData, heroClass, primordial, reaperMastery);
        }

        if (reaper === null) {
            throw new Error('failed to parse reaper');
        }

        if (reaper.smith.id === ReaperSmith.ReapersmithBrotherhood || reaper.id === 90) {
            reaper.baseReaperAffinity = Math.max(
                save.reaper_affinity[ReaperSmith.Adrianne],
                save.reaper_affinity[ReaperSmith.Astorias],
                save.reaper_affinity[ReaperSmith.Beigarth],
                save.reaper_affinity[ReaperSmith.CoryIronbender],
                save.reaper_affinity[ReaperSmith.Fulgurorn],
                save.reaper_affinity[ReaperSmith.Hagan],
                save.reaper_affinity[ReaperSmith.Smaloron]
            );
        } else {
            reaper.baseReaperAffinity = save.reaper_affinity[reaper.smith.id];
        }

        if (reaper.id === 90 && reaper.primordial) {
            reaper.baseEffectAffinity = save.reaper_affinity[ReaperSmith.Adrianne]
                + save.reaper_affinity[ReaperSmith.Astorias]
                + save.reaper_affinity[ReaperSmith.Beigarth]
                + save.reaper_affinity[ReaperSmith.CoryIronbender]
                + save.reaper_affinity[ReaperSmith.Fulgurorn]
                + save.reaper_affinity[ReaperSmith.Hagan]
                + save.reaper_affinity[ReaperSmith.Smaloron];
        } else {
            reaper.baseEffectAffinity = reaper.baseReaperAffinity;
        }

        this.slormancerReaperService.updateReaperModel(reaper);
        this.slormancerReaperService.updateReaperView(reaper);

        return reaper;
    }

    private getRunesCombination(save: GameSave, heroClass: HeroClass, reaperId: number): RunesCombination {
        let result: RunesCombination = { activation: null, effect: null, enhancement: null };

        for (let i = 0; i < save.reaper_runes.length ; i++) {
            const saveRune = save.reaper_runes[i];

            if (saveRune && saveRune.obtained && saveRune.equipped[heroClass]) {
                const rune = this.slormancerRuneService.getRuneById(i, heroClass, saveRune.level, reaperId);

                if (rune !== null) {
                    if (rune.type === RuneType.Activation) {
                        result.activation = <ActivationRune>rune;
                    } else if (rune.type === RuneType.Effect) {
                        result.effect = <EffectRune>rune;
                    } else if (rune.type === RuneType.Enhancement) {
                        result.enhancement = <EnhancementRune>rune;
                    }
                }
            }
        }

        return result;
    }

    private getEquippedUltimatum(save: GameSave, heroClass: HeroClass, bonusLevel: number): Ultimatum | null {
        let result: Ultimatum | null = null;

        const equippedIndex = save.ultimatums.findIndex(ultimatum => ultimatum.equipped[heroClass]);
        if (equippedIndex !== -1) {
            result = this.slormancerUltimatumService.getUltimatum(equippedIndex, (<GameUltimatum>save.ultimatums[equippedIndex]).level, bonusLevel)
        }

        return result;
    }

    private getAncestralLegacies(ranks: Array<number> = []): Array<AncestralLegacy> {
        return this.slormancerDataService.getGameDataAncestralLegacyIds()
            .map(id => this.slormancerAncestralLegacyService.getAncestralLegacy(id, valueOrDefault(ranks[id], 0)))
            .filter(isNotNullOrUndefined);
    }

    private getActiveNodes(equipped: Array<number> = []): Array<number> {
        return Object.entries(equipped)
            .filter(([key, equiped]) => equiped === 1)
            .map(([key, equiped]) => parseInt(key));
            
    }

    private getFirstNode(equipped: Array<number> = []): number | null {
        const firstNode = equipped.findIndex(equiped => equiped === 2);
        return firstNode === -1 ? null : firstNode;
            
    }

    private getCharacterGear(character: Character): Array<EquipableItem> {
        return [
            character.gear.amulet,
            character.gear.belt,
            character.gear.body,
            character.gear.boot,
            character.gear.bracer,
            character.gear.cape,
            character.gear.glove,
            character.gear.helm,
            character.gear.ring_l,
            character.gear.ring_r,
            character.gear.shoulder
        ].filter(isNotNullOrUndefined);
    }

    private getSkill(skillId: number, skills: Array<CharacterSkillAndUpgrades>): Skill | null {
        let result: Skill | null = null;

        if (skillId !== -1) {
            const skill = skills.map(skill => skill.skill).find(skill => skill.id === skillId);
            if (skill) {
                result = skill;
            }
        }

        return result;
    }

    private getActivableFromActivable(activable: Activable | AncestralLegacy | null , character: Character): Activable | AncestralLegacy | null {
        let result: Activable | AncestralLegacy | null = null;

        if (activable  !== null) {
            const id = (<any>activable)['isActivable'] !== undefined ? activable.id : activable.id + 200;
            result = this.getActivable(id, character);
        }

        return result;
    }

    private getActivable(activableId: number, character: Character): Activable | AncestralLegacy | null {
        let result: Activable | AncestralLegacy | null = null;

        if (activableId !== -1) {
            if (activableId >= 200) {
                const realId = activableId - 200;
                let activable = this.getCharacterGear(character)
                    .map(item => item.legendaryEffect !== null ? item.legendaryEffect.activable : null)
                    .find(activable => activable !== null && activable.id === realId);
                if (activable) {
                    result = activable;
                } else {
                    const otherActivables = [
                        character.runes.activation?.activable,
                        character.runes.effect?.activable,
                        character.runes.enhancement?.activable,
                        ...character.reaper.activables]
                        .filter(isNotNullOrUndefined);

                    const foundActivable = otherActivables.find(activable => activable.id === realId);
                    if (foundActivable) {
                        result = foundActivable;
                    }
                }
            } else if (character.ancestralLegacies.activeAncestralLegacies.indexOf(activableId) !== -1) {
                const activable = character.ancestralLegacies.ancestralLegacies
                    .find(ancestralLegacy => ancestralLegacy.id === activableId);
                if (activable) {
                    result = activable;
                }
            }
        }


        return result;
    }

    private getHeroLevel(experience: number): number {
        const xpPerLevel = this.slormancerDataService.getDataHeroNextLevelExperience();
        let level = 1;

        for (const nextLevel of xpPerLevel) {
            if (experience >= nextLevel) {
                level++;
                experience = experience - nextLevel;
            }
        }
        
        return level;
    }

    private getSharedInventory(sharedInventory: GameSharedInventory, heroClass: HeroClass): Array<Array<EquipableItem | null>> {
        const result: Array<Array<EquipableItem | null>> = [];
        const items = sharedInventory.items.map(item => this.getItem(item, heroClass))

        for (let i = 0, length = items.length; i < length; i += STASH_SIZE) {
            const stash = items.slice(i, i + STASH_SIZE);
            if (stash.length === STASH_SIZE) {
                result.push(stash);
            }
        }
        
        return result;
    }

    public getCharacterClone(character: Character): Character {
        const result: Character = {
            ...character,
            reaper: this.slormancerReaperService.getReaperClone(character.reaper),
            runes: {
                activation: character.runes.activation === null ? null : this.slormancerRuneService.getRuneClone(character.runes.activation),
                effect: character.runes.effect === null ? null : this.slormancerRuneService.getRuneClone(character.runes.effect),
                enhancement: character.runes.enhancement === null ? null : this.slormancerRuneService.getRuneClone(character.runes.enhancement),
            },
        
            ancestralLegacies: {
                ancestralLegacies: character.ancestralLegacies.ancestralLegacies.map(ancestralLegacy => this.slormancerAncestralLegacyService.getAncestralLegacyClone(ancestralLegacy)),
                activeNodes: [...character.ancestralLegacies.activeNodes],
                activeFirstNode: character.ancestralLegacies.activeFirstNode,
                activeAncestralLegacies: [...character.ancestralLegacies.activeAncestralLegacies],
                investedSlorm: character.ancestralLegacies.investedSlorm,
            },
            skills: character.skills.map(skill => this.getSkillsClone(skill)),
        
            gear: {
                helm: character.gear.helm === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.helm),
                body: character.gear.body === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.body),
                shoulder: character.gear.shoulder === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.shoulder),
                bracer: character.gear.bracer === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.bracer),
                glove: character.gear.glove === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.glove),
                boot: character.gear.boot === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.boot),
                ring_l: character.gear.ring_l === null ? null :  this.slormancerItemservice.getEquipableItemClone(character.gear.ring_l),
                ring_r: character.gear.ring_r === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.ring_r),
                amulet: character.gear.amulet === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.amulet),
                belt: character.gear.belt === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.belt),
                cape: character.gear.cape === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.cape),
            },
            inventory: character.inventory.map(item => item === null ? null : this.slormancerItemservice.getEquipableItemClone(item)),
            sharedInventory: character.sharedInventory.map(items => items.map(item => item === null ? null : this.slormancerItemservice.getEquipableItemClone(item))),

            attributes: {
                remainingPoints: 0,
                maxPoints: 0,
                allocated: {
                    [Attribute.Toughness]: this.slormancerAttributeService.getAttributeTraits(Attribute.Toughness, character.attributes.allocated[Attribute.Toughness].baseRank),
                    [Attribute.Savagery]: this.slormancerAttributeService.getAttributeTraits(Attribute.Savagery, character.attributes.allocated[Attribute.Savagery].baseRank),
                    [Attribute.Fury]: this.slormancerAttributeService.getAttributeTraits(Attribute.Fury, character.attributes.allocated[Attribute.Fury].baseRank),
                    [Attribute.Determination]: this.slormancerAttributeService.getAttributeTraits(Attribute.Determination, character.attributes.allocated[Attribute.Determination].baseRank),
                    [Attribute.Zeal]: this.slormancerAttributeService.getAttributeTraits(Attribute.Zeal, character.attributes.allocated[Attribute.Zeal].baseRank),
                    [Attribute.Willpower]: this.slormancerAttributeService.getAttributeTraits(Attribute.Willpower, character.attributes.allocated[Attribute.Willpower].baseRank),
                    [Attribute.Dexterity]: this.slormancerAttributeService.getAttributeTraits(Attribute.Dexterity, character.attributes.allocated[Attribute.Dexterity].baseRank),
                    [Attribute.Bravery]: this.slormancerAttributeService.getAttributeTraits(Attribute.Bravery, character.attributes.allocated[Attribute.Bravery].baseRank),
                }},
                
        
            primarySkill: null,
            secondarySkill: null,
            supportSkill: null,
            activable1: null,
            activable2: null,
            activable3: null,
            activable4: null
        }

        result.primarySkill = valueOrNull(result.skills.map(skill => skill.skill).find(skill => character.primarySkill !== null && skill.id === character.primarySkill.id));
        result.secondarySkill = valueOrNull(result.skills.map(skill => skill.skill).find(skill => character.secondarySkill !== null && skill.id === character.secondarySkill.id));
        result.supportSkill = valueOrNull(result.skills.map(skill => skill.skill).find(skill => character.supportSkill !== null && skill.id === character.supportSkill.id));
        result.activable1 = this.getActivableFromActivable(character.activable1, result);
        result.activable2 = this.getActivableFromActivable(character.activable2, result);
        result.activable3 = this.getActivableFromActivable(character.activable3, result);
        result.activable4 = this.getActivableFromActivable(character.activable4, result);

        return result;
    }
    
    public getCharacterFromSave(save: GameSave, heroClass: HeroClass): Character {
        const start = new Date().getTime();

        const inventory = save.inventory[heroClass];
        const element_rank = save.element_rank[heroClass];
        const skill_equip = save.skill_equip[heroClass];
        const skill_rank = save.skill_rank[heroClass];
        const traits = save.traits[heroClass];
        const auras = save.auras[heroClass];
        const xp = save.xp[heroClass];

        const reaper = this.getEquippedReaper(save, heroClass);

        const gear: CharacterGear = {
            helm: this.getItem(valueOrNull(inventory.helm), heroClass),
            body: this.getItem(valueOrNull(inventory.body), heroClass),
            shoulder: this.getItem(valueOrNull(inventory.shoulder), heroClass),
            bracer: this.getItem(valueOrNull(inventory.bracer), heroClass),
            glove: this.getItem(valueOrNull(inventory.glove), heroClass),
            boot: this.getItem(valueOrNull(inventory.boot), heroClass),
            ring_l: this.getItem(valueOrNull(inventory.ring_l), heroClass),
            ring_r: this.getItem(valueOrNull(inventory.ring_r), heroClass),
            amulet: this.getItem(valueOrNull(inventory.amulet), heroClass),
            belt: this.getItem(valueOrNull(inventory.belt), heroClass),
            cape: this.getItem(valueOrNull(inventory.cape), heroClass)
        };

        const ultimatumBonusLevel = getOlorinUltimatumBonusLevel(gear);

        const character = this.getCharacter(heroClass,
            this.getHeroLevel(xp),
            save.version,
            save.original_version,
            null,
            reaper,
            this.getRunesCombination(save, heroClass, reaper.id),
            this.getEquippedUltimatum(save, heroClass, ultimatumBonusLevel),
            this.getActiveNodes(save.element_equip[heroClass]),
            this.getFirstNode(save.element_equip[heroClass]),
            element_rank,
            skill_equip,
            skill_rank,
            gear.helm,
            gear.body,
            gear.shoulder,
            gear.bracer,
            gear.glove,
            gear.boot,
            gear.ring_l,
            gear.ring_r,
            gear.amulet,
            gear.belt,
            gear.cape,
            inventory.bag.map(item => this.getItem(item, heroClass)),
            this.getSharedInventory(save.shared_inventory, heroClass),
            Math.max(0, valueOrDefault(traits[Attribute.Toughness], 0)),
            Math.max(0, valueOrDefault(traits[Attribute.Savagery], 0)),
            Math.max(0, valueOrDefault(traits[Attribute.Fury], 0)),
            Math.max(0, valueOrDefault(traits[Attribute.Determination], 0)),
            Math.max(0, valueOrDefault(traits[Attribute.Zeal], 0)),
            Math.max(0, valueOrDefault(traits[Attribute.Willpower], 0)),
            Math.max(0, valueOrDefault(traits[Attribute.Dexterity], 0)),
            Math.max(0, valueOrDefault(traits[Attribute.Bravery], 0)),
            skill_equip.indexOf(2),
            skill_equip.indexOf(3),
            skill_equip.indexOf(4),
            valueOrDefault(auras[0], -1),
            valueOrDefault(auras[1], -1),
            valueOrDefault(auras[2], -1),
            valueOrDefault(auras[3], -1),
            false
            );

        const time = new Date().getTime() - start;
        console.log('Character built from save in ' + time + ' milliseconds');
        return character;
    }

    private getReaperLevelFromSave(save: GameSave, heroClass: HeroClass, reaperId: number, primordial: boolean): number {
        const reaperData = valueOrNull(save.weapon_data[heroClass][reaperId]);
        let level = 0;

        if (reaperData !== null) {
            const experience = reaperData.primordial.experience + reaperData.basic.experience;
            level = this.slormancerReaperService.getReaperLevel(experience);
        }
        
        return level;
    }

    private isReaperObtained(save: GameSave, heroClass: HeroClass, reaperId: number, primordial: boolean): boolean {
        const reaperData = valueOrNull(save.weapon_data[heroClass][reaperId]);
        let obtained = false;

        if (reaperData !== null) {
            obtained = primordial ? reaperData.primordial.obtained : reaperData.basic.obtained;
        }
        
        return obtained;
    }

    public getConfigFromSave(save: GameSave): Partial<CharacterConfig> {
        const config: Partial<CharacterConfig> = {};

        for (const heroClass of [HeroClass.Warrior, HeroClass.Huntress, HeroClass.Mage]) {
            for (const reaperId of UNITY_REAPERS) {
                (config as any)['unity_level_' + heroClass + '_' + reaperId] = this.isReaperObtained(save, heroClass, reaperId, false) ? this.getReaperLevelFromSave(save, heroClass, reaperId, false) : 0;
                (config as any)['unity_level_' + heroClass + '_' + reaperId + '_p'] = this.isReaperObtained(save, heroClass, reaperId, true) ? this.getReaperLevelFromSave(save, heroClass, reaperId, true) : 0;
            }
        }

        return config;
    }

    public getCharacter(heroClass: HeroClass,
                        level: number = MAX_HERO_LEVEL,
                        version: string = GAME_VERSION,
                        originalVersion: string = GAME_VERSION,
                        importVersion: string | null = null,
                        reaper: Reaper | null = null,
                        runes: RunesCombination = { activation: null, effect: null, enhancement: null },
                        ultimatum: Ultimatum | null = null,
                        activeNodes: Array<number> = [],
                        activeFirstNode: number | null = null,
                        ancestralRanks: Array<number> = [],
                        skillEquipped: Array<number> = [],
                        skillRanks: Array<number> = [],
                        helm: EquipableItem | null = null,
                        body: EquipableItem | null = null,
                        shoulder: EquipableItem | null = null,
                        bracer: EquipableItem | null = null,
                        glove: EquipableItem | null = null,
                        boot: EquipableItem | null = null,
                        ring_l: EquipableItem | null = null,
                        ring_r: EquipableItem | null = null,
                        amulet: EquipableItem | null = null,
                        belt: EquipableItem | null = null,
                        cape: EquipableItem | null = null,
                        inventory: Array<EquipableItem | null> | null = null,
                        sharedInventory: Array<Array<EquipableItem | null>> | null = null,
                        toughtness: number = 0,
                        savagery: number = 0,
                        fury: number = 0,
                        determination: number = 0,
                        zeal: number = 0,
                        willpower: number = 0,
                        dexterity: number = 0,
                        bravery: number = 0,
                        primarySkill: null | number = null,
                        secondarySkill: null | number = null,
                        supportSkill: null | number = null,
                        activable1: null | number = null,
                        activable2: null | number = null,
                        activable3: null | number = null,
                        activable4: null | number = null,
                        fromCorrupted: boolean = false
                        ): Character {
        const skills = this.getSkills(heroClass, skillEquipped, skillRanks);

        if (reaper === null) {
            reaper = this.slormancerReaperService.getDefaultReaper(heroClass);
        }

        const character: Character = {
            heroClass,
            version,
            originalVersion,
            importVersion,
            level,
            name: '',
            fullName: '',
            fromCorrupted,
            issues: [],
        
            reaper,

            runes,
        
            ancestralLegacies: {
                activeFirstNode,
                ancestralLegacies: this.getAncestralLegacies(ancestralRanks),
                activeNodes,
                activeAncestralLegacies: this.slormancerAncestralLegacyNodesService.getAncestralLegacyIds({ ancestralLegacies: { activeNodes, activeFirstNode } } as Character),
                investedSlorm: 0,
            },
            skills,
            skillInvestedSlorm: 0,

            might: {
                ancestral: 0,
                skill: 0,
                investedAncestralLegacySlorm: null,
                investedSkillSlorm: null,
            },
        
            gear: {
                helm,
                body,
                shoulder,
                bracer,
                glove,
                boot,
                ring_l,
                ring_r,
                amulet,
                belt,
                cape
            },
            inventory: inventory === null ? list(INVENTORY_SIZE).map(() => null) : inventory,
            sharedInventory: sharedInventory === null ? list(STASH_TABS_COUNT).map(() => list(STASH_SIZE).map(() => null)) : sharedInventory,

            ultimatum,

            attributes: {
                remainingPoints: Math.max(0, level - toughtness - savagery - fury - determination - zeal - willpower - dexterity - bravery),
                maxPoints: level,
                allocated: {
                    [Attribute.Toughness]: this.slormancerAttributeService.getAttributeTraits(Attribute.Toughness, toughtness),
                    [Attribute.Savagery]: this.slormancerAttributeService.getAttributeTraits(Attribute.Savagery, savagery),
                    [Attribute.Fury]: this.slormancerAttributeService.getAttributeTraits(Attribute.Fury, fury),
                    [Attribute.Determination]: this.slormancerAttributeService.getAttributeTraits(Attribute.Determination, determination),
                    [Attribute.Zeal]: this.slormancerAttributeService.getAttributeTraits(Attribute.Zeal, zeal),
                    [Attribute.Willpower]: this.slormancerAttributeService.getAttributeTraits(Attribute.Willpower, willpower),
                    [Attribute.Dexterity]: this.slormancerAttributeService.getAttributeTraits(Attribute.Dexterity, dexterity),
                    [Attribute.Bravery]: this.slormancerAttributeService.getAttributeTraits(Attribute.Bravery, bravery),
                }},
        
            mechanics: [],
            classMechanics: [],

            primarySkill: null,
            secondarySkill: null,
            supportSkill: null,
            activable1: null,
            activable2: null,
            activable3: null,
            activable4: null,

            baseStats: [],

            stats: [],
        }

        character.primarySkill = primarySkill === null ? null : this.getSkill(primarySkill, skills);
        character.secondarySkill = secondarySkill === null ? null : this.getSkill(secondarySkill, skills);
        character.supportSkill = supportSkill === null ? null : this.getSkill(supportSkill, skills);
        character.activable1 = activable1 === null ? null : this.getActivable(activable1, character);
        character.activable2 = activable2 === null ? null : this.getActivable(activable2, character);
        character.activable3 = activable3 === null ? null : this.getActivable(activable3, character);
        character.activable4 = activable4 === null ? null : this.getActivable(activable4, character);

        return character;
    }
}