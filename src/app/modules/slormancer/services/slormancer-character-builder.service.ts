import { Injectable } from '@angular/core';

import { HeroClass } from '..//model/content/enum/hero-class';
import { GAME_VERSION, INVENTORY_SIZE, MAX_HERO_LEVEL, STASH_SIZE } from '../constants/common';
import { Character, CharacterSkillAndUpgrades } from '../model/character';
import { Activable } from '../model/content/activable';
import { AncestralLegacy } from '../model/content/ancestral-legacy';
import { Attribute } from '../model/content/enum/attribute';
import { EquipableItem } from '../model/content/equipable-item';
import { Reaper } from '../model/content/reaper';
import { Skill } from '../model/content/skill';
import { Ultimatum } from '../model/content/ultimatum';
import { GameItem } from '../model/parser/game/game-item';
import { GameSave, GameSharedInventory, GameUltimatum } from '../model/parser/game/game-save';
import { list } from '../util/math.util';
import { isNotNullOrUndefined, valueOrDefault, valueOrNull } from '../util/utils';
import { SlormancerAncestralLegacyService } from './content/slormancer-ancestral-legacy.service';
import { SlormancerAttributeService } from './content/slormancer-attribute.service';
import { SlormancerDataService } from './content/slormancer-data.service';
import { SlormancerItemService } from './content/slormancer-item.service';
import { SlormancerReaperService } from './content/slormancer-reaper.service';
import { SlormancerSkillService } from './content/slormancer-skill.service';
import { SlormancerUltimatumService } from './content/slormancer-ultimatum.service';

@Injectable()
export class SlormancerCharacterBuilderService {

    constructor(private slormancerItemservice: SlormancerItemService,
                private slormancerReaperService: SlormancerReaperService,
                private slormancerDataService: SlormancerDataService,
                private slormancerSkillService: SlormancerSkillService,
                private slormancerAttributeService: SlormancerAttributeService,
                private slormancerAncestralLegacyService: SlormancerAncestralLegacyService,
                private slormancerUltimatumService: SlormancerUltimatumService
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
                stats: [],
            }
        }).filter(isNotNullOrUndefined);
    }

    private getSkillsClone(skillAndUpgrades: CharacterSkillAndUpgrades): CharacterSkillAndUpgrades {
        return {
            skill: this.slormancerSkillService.getHeroSkillClone(skillAndUpgrades.skill),
            selectedUpgrades: [...skillAndUpgrades.selectedUpgrades],
            upgrades: skillAndUpgrades.upgrades.map(upgrade => this.slormancerSkillService.getUpgradeClone(upgrade)),
            stats: [...skillAndUpgrades.stats],
        };
    }

    private getItem(item: GameItem | null, heroClass: HeroClass): EquipableItem | null {
        let result: EquipableItem | null = null;

        if (this.slormancerItemservice.isEquipableItem(item)) {
            result = this.slormancerItemservice.getEquipableItemFromGame(item, heroClass);
        }

        return result;
    }

    private getEquippedReaper(save: GameSave, heroClass: HeroClass): Reaper {
        const reaperCount = this.slormancerDataService.getGameDataReaperCount();
        let result: Reaper | null = null;

        const weaponEquip = save.weapon_equip[heroClass];
        const primordial = weaponEquip >= reaperCount;
        const reaperId = weaponEquip % reaperCount;
        const reaperData = valueOrNull(save.weapon_data[heroClass][reaperId]);

        if (reaperData !== null) {
            result = this.slormancerReaperService.getReaperFromGameWeapon(reaperData, heroClass, primordial);
        }

        if (result === null) {
            throw new Error('failed to parse reaper');
        }

        return result;
    }

    private getEquippedUltimatum(save: GameSave, heroClass: HeroClass): Ultimatum | null {
        let result: Ultimatum | null = null;

        const equippedIndex = save.ultimatums.findIndex(ultimatum => ultimatum.equipped[heroClass]);
        if (equippedIndex !== -1) {
            result = this.slormancerUltimatumService.getUltimatum(equippedIndex, (<GameUltimatum>save.ultimatums[equippedIndex]).level)
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
                } else if (character.reaper !== null) {
                    activable = character.reaper.activables
                        .find(activable => activable !== null && activable.id === realId);
                    if (activable) {
                        result = activable;
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
        
            ancestralLegacies: {
                ancestralLegacies: character.ancestralLegacies.ancestralLegacies.map(ancestralLegacy => this.slormancerAncestralLegacyService.getAncestralLegacyClone(ancestralLegacy)),
                activeNodes: [...character.ancestralLegacies.activeNodes],
                activeAncestralLegacies: [...character.ancestralLegacies.activeAncestralLegacies]
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
                    [Attribute.Toughness]: this.slormancerAttributeService.getAttributeTraits(Attribute.Toughness, character.attributes.allocated[Attribute.Toughness].rank),
                    [Attribute.Savagery]: this.slormancerAttributeService.getAttributeTraits(Attribute.Savagery, character.attributes.allocated[Attribute.Savagery].rank),
                    [Attribute.Fury]: this.slormancerAttributeService.getAttributeTraits(Attribute.Fury, character.attributes.allocated[Attribute.Fury].rank),
                    [Attribute.Determination]: this.slormancerAttributeService.getAttributeTraits(Attribute.Determination, character.attributes.allocated[Attribute.Determination].rank),
                    [Attribute.Zeal]: this.slormancerAttributeService.getAttributeTraits(Attribute.Zeal, character.attributes.allocated[Attribute.Zeal].rank),
                    [Attribute.Willpower]: this.slormancerAttributeService.getAttributeTraits(Attribute.Willpower, character.attributes.allocated[Attribute.Willpower].rank),
                    [Attribute.Dexterity]: this.slormancerAttributeService.getAttributeTraits(Attribute.Dexterity, character.attributes.allocated[Attribute.Dexterity].rank),
                    [Attribute.Bravery]: this.slormancerAttributeService.getAttributeTraits(Attribute.Bravery, character.attributes.allocated[Attribute.Bravery].rank),
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
        
        const character = this.getCharacter(heroClass,
            this.getHeroLevel(xp),
            save.version,
            save.original_version,
            null,
            this.getEquippedReaper(save, heroClass),
            this.getEquippedUltimatum(save, heroClass),
            this.getActiveNodes(save.element_equip[heroClass]),
            element_rank,
            skill_equip,
            skill_rank,
            this.getItem(valueOrNull(inventory.helm), heroClass),
            this.getItem(valueOrNull(inventory.body), heroClass),
            this.getItem(valueOrNull(inventory.shoulder), heroClass),
            this.getItem(valueOrNull(inventory.bracer), heroClass),
            this.getItem(valueOrNull(inventory.glove), heroClass),
            this.getItem(valueOrNull(inventory.boot), heroClass),
            this.getItem(valueOrNull(inventory.ring_l), heroClass),
            this.getItem(valueOrNull(inventory.ring_r), heroClass),
            this.getItem(valueOrNull(inventory.amulet), heroClass),
            this.getItem(valueOrNull(inventory.belt), heroClass),
            this.getItem(valueOrNull(inventory.cape), heroClass),
            inventory.bag.map(item => this.getItem(item, heroClass)),
            this.getSharedInventory(save.shared_inventory, heroClass),
            valueOrDefault(traits[Attribute.Toughness], 0),
            valueOrDefault(traits[Attribute.Savagery], 0),
            valueOrDefault(traits[Attribute.Fury], 0),
            valueOrDefault(traits[Attribute.Determination], 0),
            valueOrDefault(traits[Attribute.Zeal], 0),
            valueOrDefault(traits[Attribute.Willpower], 0),
            valueOrDefault(traits[Attribute.Dexterity], 0),
            valueOrDefault(traits[Attribute.Bravery], 0),
            skill_equip.indexOf(2),
            skill_equip.indexOf(3),
            skill_equip.indexOf(4),
            valueOrDefault(auras[0], -1),
            valueOrDefault(auras[1], -1),
            valueOrDefault(auras[2], -1),
            valueOrDefault(auras[3], -1)
            );

        const time = new Date().getTime() - start;
        console.log('Character built from save in ' + time + ' milliseconds');
        return character;
    }

    public getCharacter(heroClass: HeroClass,
                        level: number = MAX_HERO_LEVEL,
                        version: string = GAME_VERSION,
                        originalVersion: string = GAME_VERSION,
                        importVersion: string | null = null,
                        reaper: Reaper | null = null,
                        ultimatum: Ultimatum | null = null,
                        activeAncestralNodes: Array<number> = [],
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
                        activable4: null | number = null
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
        
            reaper,
        
            ancestralLegacies: {
                ancestralLegacies: this.getAncestralLegacies(ancestralRanks),
                activeNodes: activeAncestralNodes,
                activeAncestralLegacies: this.slormancerDataService.getAncestralSkillIdFromNodes(activeAncestralNodes)
            },
            skills,
        
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
            sharedInventory: sharedInventory === null ? list(4).map(() => list(STASH_SIZE).map(() => null)) : sharedInventory,

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