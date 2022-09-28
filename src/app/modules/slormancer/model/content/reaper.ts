import { MinMax } from '../minmax';
import { Activable } from './activable';
import { HeroClass } from './enum/hero-class';
import { ReaperBuilder } from './reaper-builder';
import { ReaperEffect } from './reaper-effect';

export interface ReaperInfo {
    kills: number;
    level: number;
}
export interface ReaperTemplates {
    name: string;
    base: Array<ReaperEffect>;
    benediction: Array<ReaperEffect>;
    malediction: Array<ReaperEffect>;
    activables: Array<Activable>;
    primordialSkills: Array<Activable>;
}

export interface Reaper {
    id: number;
    weaponClass: HeroClass;
    type: string;
    primordial: boolean;
    icon: string;
    level: number;
    baseAffinity: number;
    bonusAffinity: number;
    affinity: number;
    kills: number;
    name: string;
    description: string;
    benediction: string | null;
    malediction: string | null;
    activables: Array<Activable>,
    lore: string;
    damages: MinMax;
    damagesLabel: string;
    maxDamages: MinMax;
    maxDamagesLabel: string;
    minLevel: number;
    maxLevel: number;
    templates: ReaperTemplates;
    baseInfo: ReaperInfo;
    primordialInfo: ReaperInfo;
    smith: ReaperBuilder;
    damageType: string;
    damagesBase: MinMax;
    damagesLevel: MinMax;
    damagesMultiplier: number;

    smithLabel: string;
    victimsLabel: string;
    levelLabel: string;
    damageTypeLabel: string;
    affinityLabel: string | null;
    benedictionTitleLabel: string;
    maledictionTitleLabel: string;
    activablesTitleLabel: string;

}