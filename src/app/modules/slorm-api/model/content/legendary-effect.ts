import { Activable } from './activable';
import { CraftableEffect } from './craftable-effect';

export interface LegendaryEffect {
    id: number;
    name: string;
    reinforcment: number;
    itemIcon: string;
    activable: Activable | null;
    skillIcon: string | null;
    value: number;
    onlyStat: boolean;
    effects: Array<CraftableEffect>;

    title: string;
    description: string;

    template: string;
}