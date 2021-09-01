import { Component, OnInit } from '@angular/core';

import { GameSave } from '../slormancer';
import { DATA_REAPER_DAMAGES, DataReaperDamages } from '../slormancer/constants/data/data-reaper-damages';
import { GAME_DATA } from '../slormancer/constants/game/game-data';
import { AncestralLegacy } from '../slormancer/model/ancestral-legacy';
import { AttributeTraits } from '../slormancer/model/attribut-traits';
import { Attribute } from '../slormancer/model/enum/attribute';
import { HeroClass } from '../slormancer/model/enum/hero-class';
import { EquipableItem } from '../slormancer/model/equipable-item';
import { GameDataActivable } from '../slormancer/model/game/data/game-data-activable';
import { GameDataLegendary } from '../slormancer/model/game/data/game-data-legendary';
import { GameDataSkill } from '../slormancer/model/game/data/game-data-skill';
import { GameAffix, GameEquippableItem } from '../slormancer/model/game/game-item';
import { LegendaryEffect } from '../slormancer/model/legendary-effect';
import { Reaper } from '../slormancer/model/reaper';
import { Skill } from '../slormancer/model/skill';
import { SkillUpgrade } from '../slormancer/model/skill-upgrade';
import { SlormancerAncestralLegacyService } from '../slormancer/services/slormancer-ancestral-legacy.service';
import { SlormancerAttributeService } from '../slormancer/services/slormancer-attribute.service';
import { SlormancerDataService } from '../slormancer/services/slormancer-data.service';
import { SlormancerItemService } from '../slormancer/services/slormancer-item.service';
import { SlormancerLegendaryEffectService } from '../slormancer/services/slormancer-legendary-effect.service';
import { SlormancerReaperService } from '../slormancer/services/slormancer-reaper.service';
import { SlormancerSaveParserService } from '../slormancer/services/slormancer-save-parser.service';
import { SlormancerSkillService } from '../slormancer/services/slormancer-skill.service';
import { SlormancerTranslateService } from '../slormancer/services/slormancer-translate.service';
import { list } from '../slormancer/util/math.util';
import { enumValues, valueOrNull } from '../slormancer/util/utils';
import { SAVE } from './save';

interface Data {
    level: number | string;
    mins: number | string;
    ming: number | string;
    minsc: number | string;
    mingc: number | string;
}

@Component({
  selector: 'app-slormancer-planner',
  templateUrl: './slormancer-planner.component.html',
  styleUrls: ['./slormancer-planner.component.scss']
})
export class SlormancerPlannerComponent implements OnInit {

    public readonly DATA_REAPER_DAMAGES = DATA_REAPER_DAMAGES;
    public readonly DATA_OPTIONS = Array.from(Object.keys(DATA_REAPER_DAMAGES)).map(v => parseInt(v)).map(key => ({ value: key, label: (DATA_REAPER_DAMAGES[key] as DataReaperDamages).name }));

    public readonly ATTRIBUTE_OPTIONS: Array<{ label: string, attribute: Attribute }> = enumValues(Attribute)
            .map(attribute => ({ label: this.slormancerTranslateService.translate('character_trait_' + attribute), attribute: attribute }));

    public readonly ATTRIBUTE_POINTS: Array<{ label: string, value: number }> = list(76)
            .map(points => ({ label: points.toString(), value: points }));

    public selectedData: DataReaperDamages | null = null;
    public selectedDataIndex: number = 118;

    public formula = 'base + perLevel * max(level - 1 , 0) * ';

    public data: any = [];
    public dataTotal: any = [];

    public readonly colorScheme = {
        domain: ['#000', '#5AA454']
    };

    public readonly CLASS_OPTIONS = [
        { value: HeroClass.Huntress, label: 'Huntress' },
        { value: HeroClass.Mage, label: 'Mage' },
        { value: HeroClass.Warrior, label: 'Warrior' },
    ];
    
    public save: GameSave | null = null;

    public selectedClass: HeroClass = HeroClass.Warrior;

    public selectedAttribute: Attribute = Attribute.Determination;
    public attributePoints: number = 20;
    public selectedTrait: AttributeTraits | null = null;

    public selectedItem: number | null = 10;

    public selectedExtendedItem: EquipableItem | null = null;

    public selectedReaper: Reaper | null = null;
    public selectedReaperIndex: number | null = 3;

    public selectedSkill: Skill | null = null;
    public selectedSkillIndex: number = 0;

    public selectedAncestralLegacy: AncestralLegacy | null = null;
    public selectedAncestralLegacyIndex: number = 149;
    
    public selectedUpgrade: SkillUpgrade | null = null;
    public selectedUpgradeIndex: number = 140;

    public details: boolean = true;
    public reaperBase: number = 105;
    public primordial: boolean = true;
    public level: number = 1;
    public bonusLevel: number = 0;
    public customReaper: Reaper | null = null;

    constructor(private slormancerSaveParserService: SlormancerSaveParserService,
                private slormancerLegendaryEffectService: SlormancerLegendaryEffectService,
                private slormancerSkillService: SlormancerSkillService,
                private slormancerDataService: SlormancerDataService,
                private slormancerItemService: SlormancerItemService,
                private slormancerReaperService: SlormancerReaperService,
                private slormancerTranslateService: SlormancerTranslateService,
                private slormancerAttributeService: SlormancerAttributeService,
                private slormancerAncestralLegacyService: SlormancerAncestralLegacyService) {
        this.selectData();
    }

    public ngOnInit() {
        this.loadSave(SAVE);
        this.updateData();
    }

    public values(selectedData: DataReaperDamages): Array<Data> {
        const slorm = DATA_REAPER_DAMAGES[111];
        const gold  = DATA_REAPER_DAMAGES[112];

        let data: Array<Data> = [];

        if (slorm && gold) {
            let levels = Array.from(Object.keys(slorm.damages)).map(v => parseInt(v));

            data = levels.map(level => {
                let slormLine = slorm.damages[level];
                let goldLine = gold.damages[level];

                const goldMin = goldLine ? goldLine.min : 0;
                const slormMin = slormLine ? slormLine.min : 0;
                
                return {
                    level,
                    ming: goldMin,
                    mins: slormMin,
                    mingc: Math.round(this.compute(level, gold.base.min, gold.perLevel.min, gold.multiplier)),
                    minsc: Math.round(this.compute(level, slorm.base.min, slorm.perLevel.min, slorm.multiplier)),
                } as Data;
            });
        }

        return data;
    }

    public diffMinPrevious(selectedData: DataReaperDamages, level: number): number {
        const before = selectedData.damages[level- 1];
        const now = selectedData.damages[level- 2];
        return before && now ? before.min - now.min : 0;
    }

    public compute(level: number, base: number, perLevel: number, mult: number) {
        let result = base;
        const max = Math.max;
        const min = Math.min;
        const sum = (n: number) => (n * (n+1) / 2);
        max(min(sum(0)));
        
        try {
            result = eval(this.formula);
        } catch (e) {}
        
        return result;
    }

    public round(v: number): number {
        return Math.round(v * 1000) / 1000;
    }

    public selectData() {
        this.selectedData = valueOrNull(DATA_REAPER_DAMAGES[this.selectedDataIndex]);
    }

    public updateData() {
        this.selectedExtendedItem = null;

        if (this.selectedItem !== null) {
            const option = this.getItemOptions()[this.selectedItem];

            if (option) {
                this.selectedExtendedItem = this.slormancerItemService.getEquipableItem(option.value, this.selectedClass);
            }
        }
        if (this.selectedReaperIndex !== null) {
            const option = this.getReaperOptions()[this.selectedReaperIndex];

            if (option) {
                this.selectedReaper = option.value;
            }
        }

        if (this.selectedSkillIndex !== null) {
            this.selectedSkill = this.slormancerSkillService.getHeroSkill(this.selectedSkillIndex, this.selectedClass, this.level, this.bonusLevel);
        }

        if (this.selectedUpgradeIndex !== null) {
            this.selectedUpgrade = this.slormancerSkillService.getUpgrade(this.selectedUpgradeIndex, this.selectedClass, this.level);
        }

        if (this.selectedAncestralLegacyIndex !== null) {
            this.selectedAncestralLegacy = this.slormancerAncestralLegacyService.getAncestralLegacy(this.selectedAncestralLegacyIndex, this.level, this.bonusLevel);
        }

        this.selectedTrait = this.slormancerAttributeService.getAttributeTraits(this.selectedAttribute, this.attributePoints, this.bonusLevel);

        this.customReaper = this.slormancerReaperService.getReaper(this.reaperBase, this.selectedClass, this.primordial, this.level, this.level, 12345, 12345, this.bonusLevel);
   
        if (this.customReaper !== null) {
            this.customReaper.baseInfo.level = this.level;
            this.customReaper.primordialInfo.level = this.level;
            this.slormancerReaperService.updateReaper(this.customReaper);
        }
    }

    public getBaseItem(): any {
        return this.selectedItem !== null ? this.getItemOptions()[this.selectedItem]?.value : null;
    }

    public getLegendariesData(): Array<{ game: GameDataLegendary, activable: GameDataActivable | null, effect: LegendaryEffect }> {
        return GAME_DATA.LEGENDARY
            .map(legendary => ({ game: legendary, activable: this.slormancerDataService.getGameDataLegendaryActivableBasedOn(legendary.REF), effect: this.getLegendaryEffect(legendary) }))
            //.filter(data => data.activable !== null)
            ;
    }

    public getLegendaryItem(data: GameDataLegendary): EquipableItem | null {
        let legendary: EquipableItem | null = null;

        if (this.selectedItem !== null) {
            const option = this.getItemOptions()[this.selectedItem];

            if (option) {
                const item: GameEquippableItem = { ...option.value };
                switch (data.ITEM) {
                    case 'helm': item.slot = 0; break;
                    case 'body': item.slot = 1; break;
                    case 'shoulder': item.slot = 2; break;
                    case 'bracer': item.slot = 3; break;
                    case 'glove': item.slot = 4; break;
                    case 'boot': item.slot = 5; break;
                    case 'ring': item.slot = 6; break;
                    case 'amulet': item.slot = 7; break;
                    case 'belt': item.slot = 8; break;
                    case 'cape': item.slot = 9; break;
                    default: 
                        console.error('Unexpected item slot ' + item.slot);
                        break;
                }

                item.reinforcment = this.selectedExtendedItem === null ? 0 : this.selectedExtendedItem.reinforcment;
                item.affixes = item.affixes.filter(affix => affix.rarity !== 'L');
                item.affixes.push({
                    rarity: 'L',
                    type: data.REF,
                    value: 100,
                    locked: false,
                    pure: null
                })
                legendary = this.slormancerItemService.getEquipableItem(item, this.selectedClass);
            }
        }

        return legendary;
    }

    private getLegendaryEffect(data: GameDataLegendary): LegendaryEffect {
        const affix: GameAffix = {
            rarity: 'L',
            type: data.REF,
            value: 100,
            locked: false,
            pure: null
        }
        return <LegendaryEffect>this.slormancerLegendaryEffectService.getLegendaryEffect(affix, this.level, this.selectedClass);
    }

    public showData(data: any) {
        const id: number = data.id
        console.log(data);
        if (id !== null) {
            const gameData = this.slormancerDataService.getGameDataReaper(id);
            if (gameData !== null) {
                console.log(gameData);
                console.log(gameData.REF);
                console.log(gameData.EN_DESC);
            }
        }
    }

    public showUpgrade(selectedUpgrade: SkillUpgrade, index: number) {
        if (this.selectedSkill !== null) {
            console.log(selectedUpgrade);
            console.log(this.getUpgradesForClassAndSkill(this.selectedClass, this.selectedSkill.id).find(upgrade => upgrade.REF === index));
        }
    }

    public showSkill(selectedSkill: Skill, index: number) {
        console.log(selectedSkill);
        console.log(this.getSkillsForClass(this.selectedClass)[index]);
    }

    public clearSave() {
        this.save = null;
    }

    public loadSave(file: string) {
        this.save = this.slormancerSaveParserService.parseSaveFile(file);
    }

    public uploadSave(file: Event) {
        if (file.target !== null) {
            const files = (<HTMLInputElement>file.target).files;
            if (files !== null && files[0]) {
                this.upload(files[0]);
            }
        }
    }

    public upload(file: File) {
        var reader: FileReader | null = new FileReader();
 
		reader.onerror = () => {
			reader = null;
            alert('Failed to upload file');
 		};
		reader.onloadend = () => {
            if (reader !== null && reader.result !== null) {
                this.loadSave(reader.result.toString());
                reader = null;
            }
		};
 
		reader.readAsText(file);
    }

    public getItemOptions(): Array<{ label: string, value: GameEquippableItem }> {
        const options: Array<{ label: string, value: GameEquippableItem }> = [];

        if (this.save !== null) {
            const inventory = this.save.inventory[this.selectedClass];

            if (this.slormancerItemService.isEquipableItem(inventory.amulet)) {
                options.push({ label: this.slormancerItemService.getEquipableItemBase(inventory.amulet) + ' (E)', value: inventory.amulet });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.belt)) {
                options.push({ label: this.slormancerItemService.getEquipableItemBase(inventory.belt) + ' (E)', value: inventory.belt });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.boots)) {
                options.push({ label: this.slormancerItemService.getEquipableItemBase(inventory.boots) + ' (E)', value: inventory.boots });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.bracers)) {
                options.push({ label: this.slormancerItemService.getEquipableItemBase(inventory.bracers) + ' (E)', value: inventory.bracers });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.cape)) {
                options.push({ label: this.slormancerItemService.getEquipableItemBase(inventory.cape) + ' (E)', value: inventory.cape });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.chest)) {
                options.push({ label: this.slormancerItemService.getEquipableItemBase(inventory.chest) + ' (E)', value: inventory.chest });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.gloves)) {
                options.push({ label: this.slormancerItemService.getEquipableItemBase(inventory.gloves) + ' (E)', value: inventory.gloves });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.hemlet)) {
                options.push({ label: this.slormancerItemService.getEquipableItemBase(inventory.hemlet) + ' (E)', value: inventory.hemlet });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.ring_l)) {
                options.push({ label: this.slormancerItemService.getEquipableItemBase(inventory.ring_l) + ' (E)', value: inventory.ring_l });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.ring_r)) {
                options.push({ label: this.slormancerItemService.getEquipableItemBase(inventory.ring_r) + ' (E)', value: inventory.ring_r });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.spaulder)) {
                options.push({ label: this.slormancerItemService.getEquipableItemBase(inventory.spaulder) + ' (E)', value: inventory.spaulder });
            }

            options.push(...inventory.bag
                .filter(this.slormancerItemService.isEquipableItem)
                .map((item, i) => ({ label: this.slormancerItemService.getEquipableItemBase(item) + '(' + i + ')', value: item })));
        }

        return options;
    }

    public getReaperOptions(): Array<{ label: string, value: Reaper }> {
        let options: Array<{ label: string, value: Reaper }> = [];

        /*if (this.save !== null) {
            for (let data of this.save.weapon_data[this.selectedClass]) {

                if (data.basic.obtained) {
                    const reaper = this.slormancerReaperService.getReaper(data, this.selectedClass, false);
                    if (reaper !== null) {
                        options.push({ label: reaper.name + ' (' + reaper.level + ')', value: reaper });
                    }
                }
                if (data.primordial.obtained) {
                    const reaper = this.slormancerReaperService.getReaper(data, this.selectedClass, true);
                    if (reaper !== null) {
                        options.push({ label: reaper.name + ' (' + reaper.level + ')', value: reaper });
                    }
                }
            }
        }*/

        return options;
    }

    public getReaperBaseOptions(): Array<{ label: string, value: number }> {
        return GAME_DATA.REAPER.map(reaper => ({ label: reaper.EN_NAME, value: reaper.REF }))
            .filter(option => option.label !== null && option.label.length > 0);
    }

    public getSkillsForClass(heroClass: HeroClass): Array<GameDataSkill> {
        return GAME_DATA.SKILL[this.selectedClass]
            .filter(skill => skill.TYPE === 'support' || skill.TYPE === 'active');
    }

    public getUpgradesForClassAndSkill(heroClass: HeroClass, skillId: number): Array<GameDataSkill> {
        return GAME_DATA.SKILL[this.selectedClass]
            .filter(skill => skill.TYPE === 'upgrade' || skill.TYPE === 'passive')
            .filter(skill => skill.ACTIVE_BOX === skillId);
    }

    public getSkillBaseOptions(): Array<{ label: string, value: number }> {
        const skills = this.getSkillsForClass(this.selectedClass);

        return skills.map(skill => ({ label: skill.EN_NAME, value: skill.REF }));
    }

    public getUpgradeBaseOptions(): Array<{ label: string, value: number }> {
        let options: Array<{ label: string, value: number }> = [];

        if (this.selectedSkillIndex !== null) {
            const upgrades = this.getUpgradesForClassAndSkill(this.selectedClass, this.selectedSkillIndex);

            options = upgrades.map(upgrade => ({ label: upgrade.EN_NAME + ' (' + (upgrade.UNLOCK_LEVEL !== null ? upgrade.UNLOCK_LEVEL : 0) + ')', value: upgrade.REF }));
        }

        return options;
    }

    public getAncestralLegacyOptions(): Array<{ label: string, value: number }> {
        return GAME_DATA.ANCESTRAL_LEGACY
            .filter(ancestralLegacy => this.slormancerAncestralLegacyService.isAvailable(ancestralLegacy.REF))
            .map(ancestralLegacy => ({ label: ancestralLegacy.EN_NAME, value: ancestralLegacy.REF }));
    }
}
