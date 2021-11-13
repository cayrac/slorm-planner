import { Attribute } from '../../../slormancer/model/content/enum/attribute';
import { HeroClass } from '../../../slormancer/model/content/enum/hero-class';
import { JsonAncestralLegacy } from './json-ancestral-legacy';
import { JsonItem } from './json-item';
import { JsonReaper } from './json-reaper';
import { JsonSkill } from './json-skill';
import { JsonUltimatum } from './json-ultimatum';

export interface JsonCharacter {
    type: 'c';
    version: string;
    originalVersion: string;
    level: number;
    heroClass: HeroClass;
    gear: {
        helm: JsonItem | null;
        body: JsonItem | null;
        shoulder: JsonItem | null;
        bracer: JsonItem | null;
        glove: JsonItem | null;
        boot: JsonItem | null;
        ring_l: JsonItem | null;
        ring_r: JsonItem | null;
        amulet: JsonItem | null;
        belt: JsonItem | null;
        cape: JsonItem | null;
    };
    inventory: Array<JsonItem | null> | null;
    sharedInventory: Array<Array<JsonItem | null>> | null;

    ultimatum: JsonUltimatum | null;

    ancestralLegacies: {
        ancestralLegacies: Array<JsonAncestralLegacy>;
        nodes: Array<number>;
        maxNodes: number;
    }

    reaper: JsonReaper;

    skills: Array<JsonSkill>;

    attributes: {
        [Attribute.Toughness]: number;
        [Attribute.Savagery]: number;
        [Attribute.Fury]: number;
        [Attribute.Determination]: number;
        [Attribute.Zeal]: number;
        [Attribute.Willpower]: number;
        [Attribute.Dexterity]: number;
        [Attribute.Bravery]: number;
    };

    primary: number | null;
    secondary: number | null;
    support: number | null;
    activable1: number | null;
    activable2: number | null;
    activable3: number | null;
    activable4: number | null;
}