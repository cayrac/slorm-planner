import { Injectable } from '@angular/core';

import { MinMax } from '../model/minmax';

@Injectable()
export class SlormancerDpsService {

    public getAverageHitDamage(damages: number | MinMax, critChance: number, brutChance: number, critMultiplier: number, brutMultiplier: number): number {
        critChance = Math.min(100, critChance);
        brutChance = Math.min(100, brutChance);
        const realBrutChance = critChance * brutChance / 100;
        const realCritChance = critChance - realBrutChance
        const realNormalChance = 100 - realBrutChance - realCritChance;
        
        damages = typeof damages === 'number' ? damages : ((damages.min + damages.max) / 2);

        return (damages * realBrutChance * brutMultiplier / 10000)
             + (damages * realCritChance * critMultiplier / 10000)
             + (damages * realNormalChance / 100)
    }

    public getDps(averageDamage: number, cooldown: number, animationTime: number = 0): number {
        return averageDamage / (cooldown + animationTime)
    }
}