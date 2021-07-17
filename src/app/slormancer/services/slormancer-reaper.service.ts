import { Injectable } from '@angular/core';

import { DATA_REAPER_LEVEL } from '../constants/data/data-reaper-level';
import { HeroClass } from '../model/enum/hero-class';
import { GameWeapon } from '../model/game/game-save';
import { MinMax } from '../model/minmax';
import { Reaper } from '../model/reaper';
import { ReaperBuilder } from '../model/reaper-builder';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerReaperService {

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerTemplateService: SlormancerTemplateService) { }

    private getReaperLevel(xp: number, maxLevel: number): number {
        let level = 1;

        for (let data of DATA_REAPER_LEVEL) {
            level = data.level;

            if (data.next !== null) {
                xp -= data.next;
            }
            
            if (data.next === null || xp < 0 || level >= maxLevel) {
                break;
            }
        }

        return level;
    }

    private getReaperBuilder(id: number): ReaperBuilder {
        return {
            id,
            name: this.slormancerTemplateService.getReaperBuilderName(id)
        }
    }

    private getDamages(base: MinMax, perLevel: MinMax, level: number, multiplier: number): MinMax {
        const levelMultiplier = Math.max(0, level - 1);
        return {
            min: base.min + perLevel.min * levelMultiplier * multiplier,
            max: base.max + perLevel.max * levelMultiplier * multiplier,
        }
    }

    private updateReaperLevel(reaper: Reaper, level: number, bonusLevel: number) {
        reaper.level = level;
        reaper.bonusLevel = bonusLevel;

        reaper.damages = this.getDamages(reaper.baseDamages, reaper.damagePerLevel, level + bonusLevel, reaper.multiplier);
    }

    public getReaper(reaper: GameWeapon, weaponClass: HeroClass, primordial: boolean, bonusLevel: number = 0): Reaper | null {
        const gameData = this.slormancerDataService.getGameDataReaper(reaper.id);
        const data = primordial ? reaper.primordial : reaper.basic;
        let result: Reaper | null = null;

        if (gameData !== null) {
            const templates = this.slormancerTemplateService.getReaperDescription(gameData);
            const baseDamages = { min: gameData.BASE_DMG_MIN, max: gameData.BASE_DMG_MAX };
            const damagePerLevel = { min: gameData.MIN_DMG_LVL, max: gameData.MAX_DMG_LVL };
            const level = this.getReaperLevel(data.experience, gameData.MAX_LVL);
            result = {
                type: this.slormancerTemplateService.getReaperType(weaponClass),
                icon: 'reaper_' + weaponClass + '_' + reaper.id + (primordial ? '_p' : ''),
                primordial,
                level,
                bonusLevel,
                kills: data.kills,
                experience: data.experience,
                name: this.slormancerTemplateService.getReaperName(gameData.EN_NAME, weaponClass, primordial),
                base: templates.base === null ? null : {
                    template: templates.base,
                    effects: []
                },
                benediction: templates.benediction === null ? null : {
                    template: templates.benediction,
                    effects: []
                },
                malediction: templates.malediction === null ? null : {
                    template: templates.malediction,
                    effects: []
                },
                builder: this.getReaperBuilder(gameData.BLACKSMITH),
                baseDamages,
                damagePerLevel,
                damages: { min: 0, max: 0 },
                level100Damages: this.getDamages(baseDamages, damagePerLevel, 100, gameData.DMG_MULTIPLIER),
                damageType: 'weapon_damage',
                multiplier: gameData.DMG_MULTIPLIER,
                maxLevel: gameData.MAX_LVL,
            }

            this.updateReaperLevel(result, result.level, result.bonusLevel);
        }

        return result
    }

}