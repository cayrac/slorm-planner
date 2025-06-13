import { MinMax } from '../minmax';
import { Activable } from './activable';
import { HeroClass } from './enum/hero-class';
import { ReaperBuilder } from './reaper-builder';
import { ReaperEffect } from './reaper-effect';

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
    masteryLevel: number;
    baseLevel: number;
    bonusLevel: number;
    baseReaperAffinity: number;
    baseEffectAffinity: number;
    bonusAffinity: number;
    reaperAffinity: number;
    effectAffinity: number;
    kills: number;
    baseKills: number;
    primordialKills: number;
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
    smith: ReaperBuilder;
    damageType: string;
    damagesBase: MinMax;
    damagesLevel: MinMax;
    damagesMultiplier: number;
    evolveInto: number | null;

    smithLabel: string;
    victimsLabel: string;
    levelLabel: string;
    bonusLevelLabel: string | null;
    damageTypeLabel: string;
    masteryLabel: string | null;
    affinityLabel: string | null;
    benedictionTitleLabel: string;
    maledictionTitleLabel: string;
    activablesTitleLabel: string;

}