import { Attribute } from '../../../slormancer/model/content/enum/attribute';
import { HeroClass } from '../../../slormancer/model/content/enum/hero-class';
import { JsonAncestralLegacy } from './json-ancestral-legacy';
import { JsonItem } from './json-item';
import { JsonReaper } from './json-reaper';
import { JsonSkill } from './json-skill';

export interface JsonCharacter {
    t: 'c';
    hc: HeroClass;
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
    inv?: Array<JsonItem | null>;
    sta?: Array<Array<JsonItem | null>>;

    al: {
        al: Array<JsonAncestralLegacy>;
        nodes: Array<number>;
    }

    reas?: Array<JsonReaper>;

    rea: JsonReaper | number | null;

    skl?: Array<JsonSkill>;

    att: {
        [Attribute.Toughness]: number;
        [Attribute.Savagery]: number;
        [Attribute.Fury]: number;
        [Attribute.Determination]: number;
        [Attribute.Zeal]: number;
        [Attribute.Willpower]: number;
        [Attribute.Dexterity]: number;
        [Attribute.Bravery]: number;
    };

    pri: number | null | JsonSkill;
    sec: number | null | JsonSkill;
    act1: number | null | JsonAncestralLegacy;
    act2: number | null | JsonAncestralLegacy;
    act3: number | null | JsonAncestralLegacy;
    act4: number | null | JsonAncestralLegacy;
}