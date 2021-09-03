import { MinMax } from '../minmax';
import { Activable } from './activable';
import { HeroClass } from './enum/hero-class';
import { ReaperBuilder as ReaperSmith } from './reaper-builder';
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
    baseLevel: number;
    bonusLevel: number;
    kills: number;
    name: string;
    description: string;
    benediction: string | null;
    malediction: string | null;
    activables: Array<Activable>,
    lore: string;
    damages: MinMax;
    maxDamagesWithBonuses: MinMax;
    maxLevelWithBonuses: number;
    minLevel: number;
    maxLevel: number;
    templates: ReaperTemplates;
    baseInfo: ReaperInfo;
    primordialInfo: ReaperInfo;
    smith: ReaperSmith;
    damagesRange: { [key: number]: MinMax };
    damageType: string;

    smithLabel: string;
    victimsLabel: string;
    levelLabel: string;
    damageTypeLabel: string;
    benedictionTitleLabel: string;
    maledictionTitleLabel: string;

}