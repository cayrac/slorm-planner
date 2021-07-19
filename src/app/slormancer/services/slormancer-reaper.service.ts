import { Injectable } from '@angular/core';

import { DATA_REAPER_LEVEL } from '../constants/data/data-reaper-level';
import { HeroClass } from '../model/enum/hero-class';
import { GameDataReaper } from '../model/game/data/game-data-reaper';
import { GameWeapon } from '../model/game/game-save';
import { MinMax } from '../model/minmax';
import { Reaper } from '../model/reaper';
import { ReaperBuilder } from '../model/reaper-builder';
import { ReaperEffect } from '../model/reaper-effect';
import { isNotNullOrUndefined, valueOrNull } from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerReaperService {

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerTemplateService: SlormancerTemplateService) { }

    private getReaperLevel(xp: number): number {
        let level = 1;

        for (let data of DATA_REAPER_LEVEL) {
            level = data.level;

            if (data.next !== null) {
                xp -= data.next;
            }
            
            if (data.next === null || xp < 0) {
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

    private getParentReaperEffects(gameData: GameDataReaper): Array<ReaperEffect> {
        const templates: Array<ReaperEffect> = [];
        let data: GameDataReaper | null = gameData;

        do {
            data = this.slormancerDataService.getParentGameDataReaper(data.REF);
            if (data !== null) {
                const template = this.slormancerTemplateService.getReaperDescription(data);
                if (template.base !== null) {
                    templates.push({
                        templates: template.base,
                        effects: []
                    });
                }
            }
        } while (data !== null);

        return templates.reverse();
    }

    public getReaperDamages(reaper: Reaper, level: number): MinMax {
        let result: MinMax | null = valueOrNull(reaper.damages[level]);


        if (result === null) {
            const keys = Array.from(Object.keys(reaper.damages)).map(parseInt);
            
            let closest = <number>keys[0];

            for (const key of keys) {
                if (key > closest && key <= level) {
                    closest = key;
                }
            }

            result = <MinMax>reaper.damages[closest];
        }

        return result;
    }

    public getReaper(reaper: GameWeapon, weaponClass: HeroClass, primordial: boolean, bonusLevel: number = 0): Reaper | null {
        const data = primordial ? reaper.primordial : reaper.basic;
        const level = this.getReaperLevel(data.experience);
        return this.getReaperById(reaper.id, weaponClass, primordial, level, data.kills, bonusLevel);
    }

    public getReaperById(id: number, weaponClass: HeroClass, primordial: boolean, level: number, kills: number, bonusLevel: number = 0): Reaper | null {
        const gameData = this.slormancerDataService.getGameDataReaper(id);
        const damages = this.slormancerDataService.getDataReaperDamages(id);
        let result: Reaper | null = null;

        if (gameData !== null && damages !== null) {
            const parentEffects = this.getParentReaperEffects(gameData);
            const templates = this.slormancerTemplateService.getReaperDescription(gameData);
            const baseEffect = templates.base === null ? null : {
                templates: templates.base,
                effects: []
            };

            result = {
                type: this.slormancerTemplateService.getReaperType(weaponClass),
                icon: 'reaper_' + weaponClass + '_' + id + (primordial ? '_p' : ''),
                primordial,
                level: Math.min(level, gameData.MAX_LVL),
                bonusLevel,
                kills: kills,
                name: this.slormancerTemplateService.getReaperName(gameData.EN_NAME, weaponClass, primordial),
                base: [...parentEffects, baseEffect].filter(isNotNullOrUndefined),
                benediction: templates.benediction === null ? null : {
                    templates: templates.benediction,
                    effects: []
                },
                malediction: templates.malediction === null ? null : {
                    templates: templates.malediction,
                    effects: []
                },
                builder: this.getReaperBuilder(gameData.BLACKSMITH),
                damages,
                damageType: 'weapon_damage',
                maxLevel: gameData.MAX_LVL,
            }
        }

        return result
    }

}