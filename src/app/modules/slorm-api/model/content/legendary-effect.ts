import { Activable } from './activable';
import { CraftableEffect } from './craftable-effect';
import { HeroClass } from './enum';

export interface LegendaryEffect {
    id: number;
    name: string;
    classSpecific: HeroClass | null;
    reinforcment: number;
    itemIcon: string;
    activable: Activable | null;
    skillIcon: string | null;
    value: number;
    onlyStat: boolean;
    effects: Array<CraftableEffect>;

    reaperName: string |null;
    title: string;
    description: string;

    template: string;
}