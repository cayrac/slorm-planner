import { HeroBaseStats } from '../../../model/content/data/data-hero-base-stats';
import { GameHeroesData } from '../../../model/parser/game/game-save';

const ALL_HEROES_BASE_STATS = [
    { stat: 'the_speed_add', base: 2.4, perLevel: 0 },
    { stat: 'mana_regen_add', base: 12.2, perLevel: 1.2 },
    { stat: 'brut_chance_percent', base: 1, perLevel: 0 },
    { stat: 'brut_damage_percent', base: 300, perLevel: 0 },
    { stat: 'skill_mastery_gain_percent', base: 0, perLevel: 2 },
    { stat: 'crit_chance_percent', base: 5, perLevel: 0 },
    { stat: 'crit_damage_percent', base: 150, perLevel: 0 },
    { stat: 'inner_fire_max_number_add', base: 5, perLevel: 0 },
    { stat: 'inner_fire_duration_add', base: 12, perLevel: 0 },
    { stat: 'inner_fire_damage_add', base: 50, perLevel: 0 },
    { stat: 'overdrive_bounce_number_add', base: 2, perLevel: 0 },
    { stat: 'overdrive_damage_percent', base: 60, perLevel: 0 },
];

export const DATA_HERO_BASE_STATS: GameHeroesData<HeroBaseStats> = {
    0: {
        baseStats: [
            { stat: 'the_max_health_add', base: 294, perLevel: 68  },
            { stat: 'the_max_mana_add', base: 176, perLevel: 44 },
            { stat: 'res_phy_add', base: 11, perLevel: 4 },
            { stat: 'res_phy_add', base: 11, perLevel: 4 },
            { stat: 'health_regen_add', base: 2, perLevel: 0 },
            ...ALL_HEROES_BASE_STATS
        ],
        levelonlyStat: {
            [1]: [ { stat: 'min_basic_damage_add', value: 16.048 }, { stat: 'max_basic_damage_add', value: 21.064 - 16.048 } ],
            [2]: [ { stat: 'min_basic_damage_add', value: 19.192 }, { stat: 'max_basic_damage_add', value: 25.256 - 19.192 } ],
            [3]: [ { stat: 'min_basic_damage_add', value: 22.432 }, { stat: 'max_basic_damage_add', value: 29.576 - 22.432 } ],
            [4]: [ { stat: 'min_basic_damage_add', value: 25.768 }, { stat: 'max_basic_damage_add', value: 34.024 - 25.768 } ],
            [5]: [ { stat: 'min_basic_damage_add', value: 29.2 }, { stat: 'max_basic_damage_add', value: 38.6 - 29.2 } ],
            [6]: [ { stat: 'min_basic_damage_add', value: 32.728 }, { stat: 'max_basic_damage_add', value: 43.304 - 32.728 } ],
            [7]: [ { stat: 'min_basic_damage_add', value: 36.352 }, { stat: 'max_basic_damage_add', value: 48.136 - 36.352 } ],
            [8]: [ { stat: 'min_basic_damage_add', value: 40.072 }, { stat: 'max_basic_damage_add', value: 53.096 - 40.072 } ],
            [9]: [ { stat: 'min_basic_damage_add', value: 43.888 }, { stat: 'max_basic_damage_add', value: 58.184 - 43.888 } ],
            [10]: [ { stat: 'min_basic_damage_add', value: 47.8 }, { stat: 'max_basic_damage_add', value: 63.4 - 47.8 } ],
            [11]: [ { stat: 'min_basic_damage_add', value: 51.808 }, { stat: 'max_basic_damage_add', value: 68.744 - 51.808 } ],
            [12]: [ { stat: 'min_basic_damage_add', value: 55.912 }, { stat: 'max_basic_damage_add', value: 74.216 - 55.912 } ],
            [13]: [ { stat: 'min_basic_damage_add', value: 60.112 }, { stat: 'max_basic_damage_add', value: 79.816 - 60.112 } ],
            [14]: [ { stat: 'min_basic_damage_add', value: 64.408 }, { stat: 'max_basic_damage_add', value: 85.544 - 64.408 } ],
            [15]: [ { stat: 'min_basic_damage_add', value: 68.8 }, { stat: 'max_basic_damage_add', value: 91.4 - 68.8 } ],
            [16]: [ { stat: 'min_basic_damage_add', value: 73.288 }, { stat: 'max_basic_damage_add', value: 97.384 - 73.288 } ],
            [17]: [ { stat: 'min_basic_damage_add', value: 77.872 }, { stat: 'max_basic_damage_add', value: 103.496 - 77.872 } ],
            [18]: [ { stat: 'min_basic_damage_add', value: 82.552 }, { stat: 'max_basic_damage_add', value: 109.736 - 82.552 } ],
            [19]: [ { stat: 'min_basic_damage_add', value: 87.328 }, { stat: 'max_basic_damage_add', value: 116.104 - 87.328 } ],
            [20]: [ { stat: 'min_basic_damage_add', value: 92.2 }, { stat: 'max_basic_damage_add', value: 122.6 - 92.2 } ],
            [21]: [ { stat: 'min_basic_damage_add', value: 97.168 }, { stat: 'max_basic_damage_add', value: 129.224 - 97.168 } ],
            [22]: [ { stat: 'min_basic_damage_add', value: 102.232 }, { stat: 'max_basic_damage_add', value: 135.976 - 102.232 } ],
            [23]: [ { stat: 'min_basic_damage_add', value: 107.392 }, { stat: 'max_basic_damage_add', value: 142.856 - 107.392 } ],
            [24]: [ { stat: 'min_basic_damage_add', value: 112.648 }, { stat: 'max_basic_damage_add', value: 149.864 - 112.648 } ],
            [25]: [ { stat: 'min_basic_damage_add', value: 118 }, { stat: 'max_basic_damage_add', value: 157 - 118 } ],
            [26]: [ { stat: 'min_basic_damage_add', value: 123.448 }, { stat: 'max_basic_damage_add', value: 164.264 - 123.448 } ],
            [27]: [ { stat: 'min_basic_damage_add', value: 128.992 }, { stat: 'max_basic_damage_add', value: 171.656 - 128.992 } ],
            [28]: [ { stat: 'min_basic_damage_add', value: 134.632 }, { stat: 'max_basic_damage_add', value: 179.176 - 134.632 } ],
            [29]: [ { stat: 'min_basic_damage_add', value: 140.368 }, { stat: 'max_basic_damage_add', value: 186.824 - 140.368 } ],
            [30]: [ { stat: 'min_basic_damage_add', value: 146.2 }, { stat: 'max_basic_damage_add', value: 194.6 - 146.2 } ],
            [31]: [ { stat: 'min_basic_damage_add', value: 152.128 }, { stat: 'max_basic_damage_add', value: 202.504 - 152.128 } ],
            [32]: [ { stat: 'min_basic_damage_add', value: 158.152 }, { stat: 'max_basic_damage_add', value: 210.536 - 158.152 } ],
            [33]: [ { stat: 'min_basic_damage_add', value: 164.272 }, { stat: 'max_basic_damage_add', value: 218.696 - 164.272 } ],
            [34]: [ { stat: 'min_basic_damage_add', value: 170.488 }, { stat: 'max_basic_damage_add', value: 226.984 - 170.488 } ],
            [35]: [ { stat: 'min_basic_damage_add', value: 176.8 }, { stat: 'max_basic_damage_add', value: 235.4 - 176.8 } ],
            [36]: [ { stat: 'min_basic_damage_add', value: 183.208 }, { stat: 'max_basic_damage_add', value: 243.944 - 183.208 } ],
            [37]: [ { stat: 'min_basic_damage_add', value: 189.712 }, { stat: 'max_basic_damage_add', value: 252.616 - 189.712 } ],
            [38]: [ { stat: 'min_basic_damage_add', value: 196.312 }, { stat: 'max_basic_damage_add', value: 261.416 - 196.312 } ],
            [39]: [ { stat: 'min_basic_damage_add', value: 203.008 }, { stat: 'max_basic_damage_add', value: 270.344 - 203.008 } ],
            [40]: [ { stat: 'min_basic_damage_add', value: 209.8 }, { stat: 'max_basic_damage_add', value: 279.4 - 209.8 } ],
        },
    },
    1: {
        baseStats: [
            { stat: 'the_max_health_add', base: 192, perLevel: 44 },
            { stat: 'the_max_mana_add', base: 176, perLevel: 44 },
            { stat: 'dodge_add', base: 11, perLevel: 4 },
            { stat: 'health_on_hit_add', base: 1, perLevel: 0 },
            ...ALL_HEROES_BASE_STATS
        ],
        levelonlyStat: {
            [1]: [ { stat: 'min_basic_damage_add', value: 21.08 }, { stat: 'max_basic_damage_add', value: 29.14 - 21.08 } ],
            [2]: [ { stat: 'min_basic_damage_add', value: 25.32 }, { stat: 'max_basic_damage_add', value: 36.56 - 25.32 } ],
            [3]: [ { stat: 'min_basic_damage_add', value: 29.72 }, { stat: 'max_basic_damage_add', value: 44.26 - 29.72 } ],
            [4]: [ { stat: 'min_basic_damage_add', value: 34.28 }, { stat: 'max_basic_damage_add', value: 52.24 - 34.28 } ],
            [5]: [ { stat: 'min_basic_damage_add', value: 39 }, { stat: 'max_basic_damage_add', value: 60.5 - 39 } ],
            [6]: [ { stat: 'min_basic_damage_add', value: 43.88 }, { stat: 'max_basic_damage_add', value: 69.04 - 43.88 } ],
            [7]: [ { stat: 'min_basic_damage_add', value: 48.92 }, { stat: 'max_basic_damage_add', value: 77.86 - 48.92 } ],
            [8]: [ { stat: 'min_basic_damage_add', value: 54.12 }, { stat: 'max_basic_damage_add', value: 86.96 - 54.12 } ],
            [9]: [ { stat: 'min_basic_damage_add', value: 59.48 }, { stat: 'max_basic_damage_add', value: 96.34 - 59.48 } ],
            [10]: [ { stat: 'min_basic_damage_add', value: 65 }, { stat: 'max_basic_damage_add', value: 106 - 65 } ],
            [11]: [ { stat: 'min_basic_damage_add', value: 70.68 }, { stat: 'max_basic_damage_add', value: 115.94 - 70.68 } ],
            [12]: [ { stat: 'min_basic_damage_add', value: 76.52 }, { stat: 'max_basic_damage_add', value: 126.16 - 76.52 } ],
            [13]: [ { stat: 'min_basic_damage_add', value: 82.52 }, { stat: 'max_basic_damage_add', value: 136.66 - 82.52 } ],
            [14]: [ { stat: 'min_basic_damage_add', value: 88.68 }, { stat: 'max_basic_damage_add', value: 147.44 - 88.68 } ],
            [15]: [ { stat: 'min_basic_damage_add', value: 95 }, { stat: 'max_basic_damage_add', value: 158.5 - 95 } ],
            [16]: [ { stat: 'min_basic_damage_add', value: 101.48 }, { stat: 'max_basic_damage_add', value: 169.84 - 101.48 } ],
            [17]: [ { stat: 'min_basic_damage_add', value: 108.12 }, { stat: 'max_basic_damage_add', value: 181.46 - 108.12 } ],
            [18]: [ { stat: 'min_basic_damage_add', value: 114.92 }, { stat: 'max_basic_damage_add', value: 193.36 - 114.92 } ],
            [19]: [ { stat: 'min_basic_damage_add', value: 121.88 }, { stat: 'max_basic_damage_add', value: 205.54 - 121.88 } ],
            [20]: [ { stat: 'min_basic_damage_add', value: 129 }, { stat: 'max_basic_damage_add', value: 218 - 129 } ],
            [21]: [ { stat: 'min_basic_damage_add', value: 136.28 }, { stat: 'max_basic_damage_add', value: 230.74 - 136.28 } ],
            [22]: [ { stat: 'min_basic_damage_add', value: 143.72 }, { stat: 'max_basic_damage_add', value: 243.76 - 143.72 } ],
            [23]: [ { stat: 'min_basic_damage_add', value: 151.32 }, { stat: 'max_basic_damage_add', value: 257.06 - 151.32 } ],
            [24]: [ { stat: 'min_basic_damage_add', value: 159.08 }, { stat: 'max_basic_damage_add', value: 270.64 - 159.08 } ],
            [25]: [ { stat: 'min_basic_damage_add', value: 167 }, { stat: 'max_basic_damage_add', value: 284.5 - 167 } ],
            [26]: [ { stat: 'min_basic_damage_add', value: 175.08 }, { stat: 'max_basic_damage_add', value: 298.64 - 175.08 } ],
            [27]: [ { stat: 'min_basic_damage_add', value: 183.32 }, { stat: 'max_basic_damage_add', value: 313.06 - 183.32 } ],
            [28]: [ { stat: 'min_basic_damage_add', value: 191.72 }, { stat: 'max_basic_damage_add', value: 327.76 - 191.72 } ],
            [29]: [ { stat: 'min_basic_damage_add', value: 200.28 }, { stat: 'max_basic_damage_add', value: 342.74 - 200.28 } ],
            [30]: [ { stat: 'min_basic_damage_add', value: 209 }, { stat: 'max_basic_damage_add', value: 358 - 209 } ],
            [31]: [ { stat: 'min_basic_damage_add', value: 217.88 }, { stat: 'max_basic_damage_add', value: 373.54 - 217.88 } ],
            [32]: [ { stat: 'min_basic_damage_add', value: 226.92 }, { stat: 'max_basic_damage_add', value: 389.36 - 226.92 } ],
            [33]: [ { stat: 'min_basic_damage_add', value: 236.12 }, { stat: 'max_basic_damage_add', value: 405.46 - 236.12 } ],
            [34]: [ { stat: 'min_basic_damage_add', value: 245.48 }, { stat: 'max_basic_damage_add', value: 421.84 - 245.48 } ],
            [35]: [ { stat: 'min_basic_damage_add', value: 255 }, { stat: 'max_basic_damage_add', value: 438.5 - 255 } ],
            [36]: [ { stat: 'min_basic_damage_add', value: 264.68 }, { stat: 'max_basic_damage_add', value: 455.44 - 264.68 } ],
            [37]: [ { stat: 'min_basic_damage_add', value: 274.52 }, { stat: 'max_basic_damage_add', value: 472.66 - 274.52 } ],
            [38]: [ { stat: 'min_basic_damage_add', value: 284.52 }, { stat: 'max_basic_damage_add', value: 490.16 - 284.52 } ],
            [39]: [ { stat: 'min_basic_damage_add', value: 294.68 }, { stat: 'max_basic_damage_add', value: 507.94 - 294.68 } ],
            [40]: [ { stat: 'min_basic_damage_add', value: 305 }, { stat: 'max_basic_damage_add', value: 526 - 305 } ],
            /*

            37: 274.52-472.66
            38: 284.52-490.16
            39: 294.68-507.94
            40: 305-526
            */
        },
    },
    2: {
        baseStats: [
            { stat: 'the_max_health_add', base: 202, perLevel: 52 },
            { stat: 'the_max_mana_add', base: 340, perLevel: 66 },
            { stat: 'res_phy_add', base: 4, perLevel: 2 },
            { stat: 'res_mag_add', base: 7, perLevel: 3 },
            { stat: 'health_on_kill_add', base: 3, perLevel: 0 },
            { stat: 'min_basic_damage_add', base: 4, perLevel: 0 },
            { stat: 'max_basic_damage_add', base: 1, perLevel: 0 },
            ...ALL_HEROES_BASE_STATS
        ],
        levelonlyStat: {
            [1]: [ { stat: 'min_elemental_damage_add', value: 24.048 }, { stat: 'max_elemental_damage_add', value: 29.064 - 24.048 } ],
            [2]: [ { stat: 'min_elemental_damage_add', value: 27.192 }, { stat: 'max_elemental_damage_add', value: 33.256 - 27.192 } ],
            [3]: [ { stat: 'min_elemental_damage_add', value: 30.432 }, { stat: 'max_elemental_damage_add', value: 37.576 - 30.432 } ],
            [4]: [ { stat: 'min_elemental_damage_add', value: 33.768 }, { stat: 'max_elemental_damage_add', value: 42.024 - 33.768 } ],
            [5]: [ { stat: 'min_elemental_damage_add', value: 37.2 }, { stat: 'max_elemental_damage_add', value: 46.6 - 37.2 } ],
            [6]: [ { stat: 'min_elemental_damage_add', value: 40.728 }, { stat: 'max_elemental_damage_add', value: 51.304 - 40.728 } ],
            [7]: [ { stat: 'min_elemental_damage_add', value: 44.352 }, { stat: 'max_elemental_damage_add', value: 56.136 - 44.352 } ],
            [8]: [ { stat: 'min_elemental_damage_add', value: 48.072 }, { stat: 'max_elemental_damage_add', value: 61.096 - 48.072 } ],
            [9]: [ { stat: 'min_elemental_damage_add', value: 51.888 }, { stat: 'max_elemental_damage_add', value: 66.184 - 51.888 } ],
            [10]: [ { stat: 'min_elemental_damage_add', value: 55.8 }, { stat: 'max_elemental_damage_add', value: 71.4 - 55.8 } ],
            [11]: [ { stat: 'min_elemental_damage_add', value: 59.808 }, { stat: 'max_elemental_damage_add', value: 76.744 - 59.808 } ],
            [12]: [ { stat: 'min_elemental_damage_add', value: 63.912 }, { stat: 'max_elemental_damage_add', value: 82.216 - 63.912 } ],
            [13]: [ { stat: 'min_elemental_damage_add', value: 68.112 }, { stat: 'max_elemental_damage_add', value: 87.816 - 68.112 } ],
            [14]: [ { stat: 'min_elemental_damage_add', value: 72.408 }, { stat: 'max_elemental_damage_add', value: 93.544 - 72.408 } ],
            [15]: [ { stat: 'min_elemental_damage_add', value: 76.8 }, { stat: 'max_elemental_damage_add', value: 99.4 - 76.8 } ],
            [16]: [ { stat: 'min_elemental_damage_add', value: 81.288 }, { stat: 'max_elemental_damage_add', value: 105.384 - 81.288 } ],
            [17]: [ { stat: 'min_elemental_damage_add', value: 85.872 }, { stat: 'max_elemental_damage_add', value: 111.496 - 85.872 } ],
            [18]: [ { stat: 'min_elemental_damage_add', value: 90.552 }, { stat: 'max_elemental_damage_add', value: 117.736 - 90.552 } ],
            [19]: [ { stat: 'min_elemental_damage_add', value: 95.328 }, { stat: 'max_elemental_damage_add', value: 124.104 - 95.328 } ],
            [20]: [ { stat: 'min_elemental_damage_add', value: 100.2 }, { stat: 'max_elemental_damage_add', value: 130.6 - 100.2 } ],
            [21]: [ { stat: 'min_elemental_damage_add', value: 105.168 }, { stat: 'max_elemental_damage_add', value: 137.224 - 105.168 } ],
            [22]: [ { stat: 'min_elemental_damage_add', value: 110.232 }, { stat: 'max_elemental_damage_add', value: 143.976 - 110.232 } ],
            [23]: [ { stat: 'min_elemental_damage_add', value: 115.392 }, { stat: 'max_elemental_damage_add', value: 150.856 - 115.392 } ],
            [24]: [ { stat: 'min_elemental_damage_add', value: 120.648 }, { stat: 'max_elemental_damage_add', value: 157.864 - 120.648 } ],
            [25]: [ { stat: 'min_elemental_damage_add', value: 126 }, { stat: 'max_elemental_damage_add', value: 165 - 126 } ],
            [26]: [ { stat: 'min_elemental_damage_add', value: 131.448 }, { stat: 'max_elemental_damage_add', value: 172.264 - 131.448 } ],
            [27]: [ { stat: 'min_elemental_damage_add', value: 136.992 }, { stat: 'max_elemental_damage_add', value: 179.656 - 136.992 } ],
            [28]: [ { stat: 'min_elemental_damage_add', value: 142.632 }, { stat: 'max_elemental_damage_add', value: 187.176 - 142.632 } ],
            [29]: [ { stat: 'min_elemental_damage_add', value: 148.368 }, { stat: 'max_elemental_damage_add', value: 194.824 - 148.368 } ],
            [30]: [ { stat: 'min_elemental_damage_add', value: 154.2 }, { stat: 'max_elemental_damage_add', value: 202.6 - 154.2 } ],
            [31]: [ { stat: 'min_elemental_damage_add', value: 160.128 }, { stat: 'max_elemental_damage_add', value: 210.504 - 160.128 } ],
            [32]: [ { stat: 'min_elemental_damage_add', value: 166.152 }, { stat: 'max_elemental_damage_add', value: 218.536 - 166.152 } ],
            [33]: [ { stat: 'min_elemental_damage_add', value: 172.272 }, { stat: 'max_elemental_damage_add', value: 226.696 - 172.272 } ],
            [34]: [ { stat: 'min_elemental_damage_add', value: 178.488 }, { stat: 'max_elemental_damage_add', value: 234.984 - 178.488 } ],
            [35]: [ { stat: 'min_elemental_damage_add', value: 184.8 }, { stat: 'max_elemental_damage_add', value: 243.4 - 184.8 } ],
            [36]: [ { stat: 'min_elemental_damage_add', value: 191.208 }, { stat: 'max_elemental_damage_add', value: 251.944 - 191.208 } ],
            [37]: [ { stat: 'min_elemental_damage_add', value: 197.712 }, { stat: 'max_elemental_damage_add', value: 260.616 - 197.712 } ],
            [38]: [ { stat: 'min_elemental_damage_add', value: 204.312 }, { stat: 'max_elemental_damage_add', value: 269.416 - 204.312 } ],
            [39]: [ { stat: 'min_elemental_damage_add', value: 211.008 }, { stat: 'max_elemental_damage_add', value: 278.344 - 211.008 } ],
            [40]: [ { stat: 'min_elemental_damage_add', value: 217.8 }, { stat: 'max_elemental_damage_add', value: 287.4 - 217.8 } ],
        },
    }
};

/*
    knight bonus per level :
    total 1: 16.048/21.064 raw / +362 max life / +220 mana / +14 mana regen / +15 armor / +2% mastery / +2 life regen

    1+: 4-5 raw / +68 max life / +44 mana / +1.2 mana regen / +4 armor / +2% mastery
    9+: 4-6 raw / +68 max life / +44 mana / +1.2 mana regen / +4 armor / +2% mastery
    11+: 5-6 raw / +68 max life / +44 mana / +1.2 mana regen / +4 armor / +2% mastery
    17+: 5-7 raw / +68 max life / +44 mana / +1.2 mana regen / +4 armor / +2% mastery
    22+: 6-7 raw / +68 max life / +44 mana / +1.2 mana regen / +4 armor / +2% mastery
    24+: 6-8 raw / +68 max life / +44 mana / +1.2 mana regen / +4 armor / +2% mastery
    32+: 7-9 raw / +68 max life / +44 mana / +1.2 mana regen / +4 armor / +2% mastery
    40+: 7-10 raw / +68 max life / +44 mana / +1.2 mana regen / +4 armor / +2% mastery

    1: 16.048-21.064
    2: 19.192-25.256
    3: 22.432-29.576
    4: 25.768-34.024
    5: 29.2-38.6
    6: 32.728-43.304
    7: 36.352-48.136
    8: 40.072-53.096
    9: 43.888-58.184
    10: 47.8-63.4
    11: 51.808-68.744
    12: 55.912-74.216
    13: 60.112-79.816
    14: 64.408-85.544
    15: 68.8-91.4
    16: 73.288-97.384
    17: 77.872-103.496
    18: 82.552-109.736
    19: 87.328-116.104
    20: 92.2-122.6
    21: 97.168-129.224
    22: 102.232-135.976
    23: 107.392-142.856
    24: 112.648-149.864
    25: 118-157
    26: 123.448-164.264
    27: 128.992-171.656
    28: 134.632-179.176
    29: 140.368-186.824
    30: 146.2-194.6
    31: 152.128-202.504
    32: 158.152-210.536
    33: 164.272-218.696
    34: 170.488-226.984
    35: 176.8-235.4
    36: 183.208-243.944
    37: 189.712-252.616
    38: 196.312-261.416
    39: 203.008-270.344
    40: 209.8-279.4

    hunt bonus per level :
    total 1: 21.08-29.14 raw / +236 max life / +220 mana / +14 mana regen / +15 evasion / +2% mastery /+1 life on hit / 1% ancestral strike chance

    1+: 5-8 raw / +44 max life / +44 mana / +1.2 mana regen / +4 evasion / +2% mastery
    5+: 5-9 raw / +44 max life / +44 mana / +1.2 mana regen / +4 evasion / +2% mastery
    7+: 6-9 raw / +44 max life / +44 mana / +1.2 mana regen / +4 evasion / +2% mastery
    8+: 6-10 raw / +44 max life / +44 mana / +1.2 mana regen / +4 evasion / +2% mastery
    12+: 6-11 raw / +44 max life / +44 mana / +1.2 mana regen / +4 evasion / +2% mastery
    14+: 7-11 raw / +44 max life / +44 mana / +1.2 mana regen / +4 evasion / +2% mastery
    15+: 7-12 raw / +44 max life / +44 mana / +1.2 mana regen / +4 evasion / +2% mastery
    19+: 7-13 raw / +44 max life / +44 mana / +1.2 mana regen / +4 evasion / +2% mastery
    20+: 8-13 raw / +44 max life / +44 mana / +1.2 mana regen / +4 evasion / +2% mastery
    22+: 8-14 raw / +44 max life / +44 mana / +1.2 mana regen / +4 evasion / +2% mastery
    26+: 9-15 raw / +44 max life / +44 mana / +1.2 mana regen / +4 evasion / +2% mastery
    30+: 9-16 raw / +44 max life / +44 mana / +1.2 mana regen / +4 evasion / +2% mastery
    32+: 10-16 raw / +44 max life / +44 mana / +1.2 mana regen / +4 evasion / +2% mastery
    33+: 10-17 raw / +44 max life / +44 mana / +1.2 mana regen / +4 evasion / +2% mastery
    37+: 10-18 raw / +44 max life / +44 mana / +1.2 mana regen / +4 evasion / +2% mastery
    39+: 11-18 raw / +44 max life / +44 mana / +1.2 mana regen / +4 evasion / +2% mastery
    40+: 11-19 raw / +44 max life / +44 mana / +1.2 mana regen / +4 evasion / +2% mastery

    1: 21.08 -29.14
    2: 25.32 -36.56
    3: 29.72 -44.26
    4: 34.28 -52.24
    5: 39    -60.5
    6: 43.88 -69.04
    7: 48.92 -77.86
    8: 54.12 -86.96
    9: 59.48 -96.34
    10: 65-106
    11: 70.68-115.94
    12: 76.52-126.16
    13: 82.52-136.66
    14: 88.68-147.44
    15: 95-158.5
    16: 101.48-169.84
    17: 108.12-181.46
    18: 114.92-193.36
    19: 121.88-205.54
    20: 129-218
    21: 136.28-230.74
    22: 143.72-243.76
    23: 151.32-257.06
    24: 159.08-270.64
    25: 167-284.5
    26:175.08-298.64
    27: 183.32-313.06
    28: 191.72-327.76
    29: 200.28-342.74
    30: 209-358
    31: 217.88-373.54
    32: 226.92-389.36
    33: 236.12-405.46
    34: 245.48-421.84
    35: 255-438.5
    36: 264.68-455.44
    37: 274.52-472.66
    38: 284.52-490.16
    39: 294.68-507.94
    40: 305-526

    mage bonus per level :
    total 1: 4-5 raw / 24.048-29.064  ele / +254 max life / +406 mana / +14 mana regen / +6 armor / +10 magr / +2% mastery / 1% ancestral strike chance / +3 life on kill

    1+: 4-5 ele / +52 max life / +66 mana / +1.2 mana regen / +2 armor / +3 magr / +2% mastery
    9+: 4-6 ele / +52 max life / +66 mana / +1.2 mana regen / +2 armor / +3 magr / +2% mastery
    11+: 5-6 ele / +52 max life / +66 mana / +1.2 mana regen / +2 armor / +3 magr / +2% mastery
    17+: 5-7 ele / +52 max life / +66 mana / +1.2 mana regen / +2 armor / +3 magr / +2% mastery
    22+: 6-7 ele / +52 max life / +66 mana / +1.2 mana regen / +2 armor / +3 magr / +2% mastery
    24+: 6-8 ele / +52 max life / +66 mana / +1.2 mana regen / +2 armor / +3 magr / +2% mastery
    32+: 7-9 ele / +52 max life / +66 mana / +1.2 mana regen / +2 armor / +3 magr / +2% mastery
    40+: 7-10 ele / +52 max life / +66 mana / +1.2 mana regen / +2 armor / +3 magr / +2% mastery

    1: 24.048-29.064
    2: 27.192-33.256
    3: 30.432-37.576
    4: 33.768-42.024
    5: 37.2-46.6
    6: 40.728-51.304
    7: 44.352-56.136
    8: 48.072-61.096
    9: 51.888-66.184
    10: 55.8-71.4
    11: 59.808-76.744
    12: 63.912-82.216
    13: 68.112-87.816
    14: 72.408-93.544
    15: 76.8-99.4
    16: 81.288-105.384
    17: 85.872-111.496
    18: 90.552-117.736
    19: 95.328-124.104
    20: 100.2-130.6
    21: 105.168-137.224
    22: 110.232-143.976
    23: 115.392-150.856
    24: 120.648-157.864
    25: 126-165
    26: 131.448-172.264
    27: 136.992-179.656
    28: 142.632-187.176
    29: 148.368-194.824
    30: 154.2-202.6
    31: 160.128-210.504
    32: 166.152-218.536
    33: 172.272-226.696
    34: 178.488-234.984
    35: 184.8-243.4
    36: 191.208-251.944
    37: 197.712-260.616
    38: 204.312-269.416
    39: 211.008-278.344
    40: 217.8-287.4

*/