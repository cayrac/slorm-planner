import { HeroBaseStats } from '../../../model/content/data/data-hero-base-stats';
import { GameHeroesData } from '../../../model/parser/game/game-save';
import { round } from '../../../util/math.util';
import { ARCANE_BOND_DURATION, BASE_MOVEMENT_SPEED, MAX_EMBLEMS, TIME_LOCK_DURATION, TRAP_ARM_DURATION } from '../../common';

const ALL_HEROES_BASE_STATS = [
    { stat: 'the_speed_add', base: BASE_MOVEMENT_SPEED, perLevel: 0 },
    { stat: 'mana_regen_add', base: 12.2, perLevel: 1.2 },
    { stat: 'brut_chance_percent', base: 1, perLevel: 0 },
    { stat: 'skill_mastery_gain_percent', base: 0, perLevel: 1 },
    { stat: 'crit_chance_percent', base: 5, perLevel: 0 },
    { stat: 'crit_damage_percent', base: 150, perLevel: 0 },
    { stat: 'inner_fire_max_number_add', base: 5, perLevel: 0 },
    { stat: 'inner_fire_duration_add', base: 7, perLevel: 0 },
    { stat: 'base_inner_fire_damage_percent', base: -50, perLevel: 0 },
    { stat: 'overdrive_bounce_number_add', base: 2, perLevel: 0 },
    { stat: 'overdrive_damage_percent', base: -40, perLevel: 0 },
    { stat: 'shield_globe_duration_add', base: 3, perLevel: 0 },
    { stat: 'shield_globe_value_add', base: 0, perLevel: 3 },
];


export const DATA_HERO_BASE_STATS: GameHeroesData<HeroBaseStats> = {
    0: {
        baseStats: [
            { stat: 'the_max_health_add', base: 294, perLevel: 68  },
            { stat: 'character_the_max_mana_add', base: 176, perLevel: 44 },
            { stat: 'res_phy_add', base: 11, perLevel: 4 },
            // { stat: 'health_regen_add', base: 2, perLevel: 0 },
            { stat: 'skewer_max_stack_add', base: 5, perLevel: 0 },
            { stat: 'skewer_damage_percent_add', base: 10, perLevel: 0 },
            { stat: 'block_damage_reduction_add', base: 90, perLevel: 0 },
            ...ALL_HEROES_BASE_STATS
        ],
        levelonlyStat: {
            1: [
                { stat: 'min_basic_damage_add', value: 19.096 }, { stat: 'max_basic_damage_add', value: round(25.128 - 19.096, 3) }
            ],
            2: [
                { stat: 'min_basic_damage_add', value: 25.384 }, { stat: 'max_basic_damage_add', value: round(33.512 - 25.384, 3) }
            ],
            3: [
                { stat: 'min_basic_damage_add', value: 31.864 }, { stat: 'max_basic_damage_add', value: round(42.152 - 31.864, 3) }
            ],
            4: [
                { stat: 'min_basic_damage_add', value: 38.536 }, { stat: 'max_basic_damage_add', value: round(51.048 - 38.536, 3) }
            ],
            5: [
                { stat: 'min_basic_damage_add', value: 45.4 }, { stat: 'max_basic_damage_add', value: round(60.2 - 45.4, 3) }
            ],
            6: [
                { stat: 'min_basic_damage_add', value: 52.456 }, { stat: 'max_basic_damage_add', value: round(69.608 - 52.456, 3) }
            ],
            7: [
                { stat: 'min_basic_damage_add', value: 59.704 }, { stat: 'max_basic_damage_add', value: round(79.272 - 59.704, 3) }
            ],
            8: [
                { stat: 'min_basic_damage_add', value: 67.144 }, { stat: 'max_basic_damage_add', value: round(89.192 - 67.144, 3) }
            ],
            9: [
                { stat: 'min_basic_damage_add', value: 74.776 }, { stat: 'max_basic_damage_add', value: round(99.368 - 74.776, 3) }
            ],
            10: [
                { stat: 'min_basic_damage_add', value: 82.6 }, { stat: 'max_basic_damage_add', value: round(109.8 - 82.6, 3) }
            ],
            11: [
                { stat: 'min_basic_damage_add', value: 90.616 }, { stat: 'max_basic_damage_add', value: round(120.488 - 90.616, 3) }
            ],
            12: [
                { stat: 'min_basic_damage_add', value: 98.824 }, { stat: 'max_basic_damage_add', value: round(131.432 - 98.824, 3) }
            ],
            13: [
                { stat: 'min_basic_damage_add', value: 107.224 }, { stat: 'max_basic_damage_add', value: round(142.632 - 107.224, 3) }
            ],
            14: [
                { stat: 'min_basic_damage_add', value: 115.816 }, { stat: 'max_basic_damage_add', value: round(154.088 - 115.816, 3) }
            ],
            15: [
                { stat: 'min_basic_damage_add', value: 124.6 }, { stat: 'max_basic_damage_add', value: round(165.8 - 124.6, 3) }
            ],
            16: [
                { stat: 'min_basic_damage_add', value: 133.576 }, { stat: 'max_basic_damage_add', value: round(177.768 - 133.576, 3) }
            ],
            17: [
                { stat: 'min_basic_damage_add', value: 142.744 }, { stat: 'max_basic_damage_add', value: round(189.992 - 142.744, 3) }
            ],
            18: [
                { stat: 'min_basic_damage_add', value: 152.104 }, { stat: 'max_basic_damage_add', value: round(202.472 - 152.104, 3) }
            ],
            19: [
                { stat: 'min_basic_damage_add', value: 161.656 }, { stat: 'max_basic_damage_add', value: round(215.208 - 161.656, 3) }
            ],
            20: [
                { stat: 'min_basic_damage_add', value: 171.4 }, { stat: 'max_basic_damage_add', value: round(228.2 - 171.4, 3) }
            ],
            21: [
                { stat: 'min_basic_damage_add', value: 181.336 }, { stat: 'max_basic_damage_add', value: round(241.448 - 181.336, 3) }
            ],
            22: [
                { stat: 'min_basic_damage_add', value: 191.464 }, { stat: 'max_basic_damage_add', value: round(254.952 - 191.464, 3) }
            ],
            23: [
                { stat: 'min_basic_damage_add', value: 201.784 }, { stat: 'max_basic_damage_add', value: round(268.72 - 201.784, 3) }
            ],
            24: [
                { stat: 'min_basic_damage_add', value: 212.296 }, { stat: 'max_basic_damage_add', value: round(282.728 - 212.296, 3) }
            ],
            25: [
                { stat: 'min_basic_damage_add', value: 223 }, { stat: 'max_basic_damage_add', value: round(297 - 223, 3) }
            ],
            26: [
                { stat: 'min_basic_damage_add', value: 233.896 }, { stat: 'max_basic_damage_add', value: round(311.528 - 233.896, 3) }
            ],
            27: [
                { stat: 'min_basic_damage_add', value: 244.984 }, { stat: 'max_basic_damage_add', value: round(326.312 - 244.984, 3) }
            ],
            28: [
                { stat: 'min_basic_damage_add', value: 256.264 }, { stat: 'max_basic_damage_add', value: round(341.352 - 256.264, 3) }
            ],
            29: [
                { stat: 'min_basic_damage_add', value: 267.736 }, { stat: 'max_basic_damage_add', value: round(356.648 - 267.736, 3) }
            ],
            30: [
                { stat: 'min_basic_damage_add', value: 279.4 }, { stat: 'max_basic_damage_add', value: round(372.2 - 279.4, 3) }
            ],
            31: [
                { stat: 'min_basic_damage_add', value: 291.256 }, { stat: 'max_basic_damage_add', value: round(388.008 - 291.256, 3) }
            ],
            32: [
                { stat: 'min_basic_damage_add', value: 303.304 }, { stat: 'max_basic_damage_add', value: round(404.072 - 303.304, 3) }
            ],
            33: [
                { stat: 'min_basic_damage_add', value: 315.544 }, { stat: 'max_basic_damage_add', value: round(420.392 - 315.544, 3) }
            ],
            34: [
                { stat: 'min_basic_damage_add', value: 327.976 }, { stat: 'max_basic_damage_add', value: round(436.968 - 327.976, 3) }
            ],
            35: [
                { stat: 'min_basic_damage_add', value: 340.6 }, { stat: 'max_basic_damage_add', value: round(453.8 - 340.6, 3) }
            ],
            36: [
                { stat: 'min_basic_damage_add', value: 353.416 }, { stat: 'max_basic_damage_add', value: round(470.888 - 353.416, 3) }
            ],
            37: [
                { stat: 'min_basic_damage_add', value: 366.424 }, { stat: 'max_basic_damage_add', value: round(488.232 - 366.424, 3) }
            ],
            38: [
                { stat: 'min_basic_damage_add', value: 379.624 }, { stat: 'max_basic_damage_add', value: round(505.832 - 379.624, 3) }
            ],
            39: [
                { stat: 'min_basic_damage_add', value: 393.016 }, { stat: 'max_basic_damage_add', value: round(523.688 - 393.016, 3) }
            ],
            40: [
                { stat: 'min_basic_damage_add', value: 406.6 }, { stat: 'max_basic_damage_add', value: round(541.8 - 406.6, 3) }
            ],
            41: [
                { stat: 'min_basic_damage_add', value: 420.376 }, { stat: 'max_basic_damage_add', value: round(560.168 - 420.376, 3) }
            ],
            42: [
                { stat: 'min_basic_damage_add', value: 434.344 }, { stat: 'max_basic_damage_add', value: round(578.792 - 434.344, 3) }
            ],
            43: [
                { stat: 'min_basic_damage_add', value: 448.504 }, { stat: 'max_basic_damage_add', value: round(597.672 - 448.504, 3) }
            ],
            44: [
                { stat: 'min_basic_damage_add', value: 462.856 }, { stat: 'max_basic_damage_add', value: round(616.808 - 462.856, 3) }
            ],
            45: [
                { stat: 'min_basic_damage_add', value: 477.4 }, { stat: 'max_basic_damage_add', value: round(636.2 - 477.4, 3) }
            ],
            46: [
                { stat: 'min_basic_damage_add', value: 492.136 }, { stat: 'max_basic_damage_add', value: round(655.848 - 492.136, 3) }
            ],
            47: [
                { stat: 'min_basic_damage_add', value: 507.064 }, { stat: 'max_basic_damage_add', value: round(675.752 - 507.064, 3) }
            ],
            48: [
                { stat: 'min_basic_damage_add', value: 522.184 }, { stat: 'max_basic_damage_add', value: round(695.912 - 522.184, 3) }
            ],
            49: [
                { stat: 'min_basic_damage_add', value: 537.496 }, { stat: 'max_basic_damage_add', value: round(716.328 - 537.496, 3) }
            ],
            50: [
                { stat: 'min_basic_damage_add', value: 553 }, { stat: 'max_basic_damage_add', value: round(737 - 553, 3) }
            ],
            51: [
                { stat: 'min_basic_damage_add', value: 568.696 }, { stat: 'max_basic_damage_add', value: round(757.928 - 568.696, 3) }
            ],
            52: [
                { stat: 'min_basic_damage_add', value: 584.5584 }, { stat: 'max_basic_damage_add', value: round(779.112 - 584.5584, 3) }
            ],
            53: [
                { stat: 'min_basic_damage_add', value: 600.664 }, { stat: 'max_basic_damage_add', value: round(800.552 - 600.664, 3) }
            ],
            54: [
                { stat: 'min_basic_damage_add', value: 616.936 }, { stat: 'max_basic_damage_add', value: round(822.248 - 616.936, 3) }
            ],
            55: [
                { stat: 'min_basic_damage_add', value: 633.4 }, { stat: 'max_basic_damage_add', value: round(844.2 - 633.4, 3) }
            ],
            56: [
                { stat: 'min_basic_damage_add', value: 650.056 }, { stat: 'max_basic_damage_add', value: round(866.408 - 650.056, 3) }
            ],
            57: [
                { stat: 'min_basic_damage_add', value: 666.872 }, { stat: 'max_basic_damage_add', value: round(888.872 - 666.872, 3) }
            ],
            58: [
                { stat: 'min_basic_damage_add', value: 683.944 }, { stat: 'max_basic_damage_add', value: round(911.592 - 683.944, 3) }
            ],
            59: [
                { stat: 'min_basic_damage_add', value: 701.176 }, { stat: 'max_basic_damage_add', value: round(934.568 - 701.176, 3) }
            ],
            60: [
                { stat: 'min_basic_damage_add', value: 718.6 }, { stat: 'max_basic_damage_add', value: round(957.8 - 718.6, 3) }
            ],
            61: [
                { stat: 'min_basic_damage_add', value: 736.216 }, { stat: 'max_basic_damage_add', value: round(981.288 - 736.216, 3) }
            ],
            62: [
                { stat: 'min_basic_damage_add', value: 754.024 }, { stat: 'max_basic_damage_add', value: round(1005.032 - 754.024, 3) }
            ],
            63: [
                { stat: 'min_basic_damage_add', value: 772.024 }, { stat: 'max_basic_damage_add', value: round(1029.032 - 772.024, 3) }
            ],
            64: [
                { stat: 'min_basic_damage_add', value: 790.216 }, { stat: 'max_basic_damage_add', value: round(1053.288 - 790.216, 3) }
            ],
            65: [
                { stat: 'min_basic_damage_add', value: 808.6 }, { stat: 'max_basic_damage_add', value: round(1077.8 - 808.6, 3) }
            ],
            66: [
                { stat: 'min_basic_damage_add', value: 827.176 }, { stat: 'max_basic_damage_add', value: round(1102.568 - 827.176, 3) }
            ],
            67: [
                { stat: 'min_basic_damage_add', value: 845.944 }, { stat: 'max_basic_damage_add', value: round(1127.592 - 845.944, 3) }
            ],
            68: [
                { stat: 'min_basic_damage_add', value: 864.904 }, { stat: 'max_basic_damage_add', value: round(1152.872 - 864.904, 3) }
            ],
            69: [
                { stat: 'min_basic_damage_add', value: 884.056 }, { stat: 'max_basic_damage_add', value: round(1178.408 - 884.056, 3) }
            ],
            70: [
                { stat: 'min_basic_damage_add', value: 903.4 }, { stat: 'max_basic_damage_add', value: round(1204.2 - 903.4, 3) }
            ],
            71: [
                { stat: 'min_basic_damage_add', value: 922.936 }, { stat: 'max_basic_damage_add', value: round(1230.248 - 922.936, 3) }
            ],
            72: [
                { stat: 'min_basic_damage_add', value: 942.664 }, { stat: 'max_basic_damage_add', value: round(1256.552 - 942.664, 3) }
            ],
            73: [
                { stat: 'min_basic_damage_add', value: 962.584 }, { stat: 'max_basic_damage_add', value: round(1283.112 - 962.584, 3) }
            ],
            74: [
                { stat: 'min_basic_damage_add', value: 982.696 }, { stat: 'max_basic_damage_add', value: round(1309.928 - 982.696, 3) }
            ],
            75: [
                { stat: 'min_basic_damage_add', value: 1003 }, { stat: 'max_basic_damage_add', value: round(1337 - 1003, 3) }
            ],
            76: [
                { stat: 'min_basic_damage_add', value: 1023.496 }, { stat: 'max_basic_damage_add', value: round(1364.328 - 1023.496, 3) }
            ],
            77: [
                { stat: 'min_basic_damage_add', value: 1044.184 }, { stat: 'max_basic_damage_add', value: round(1391.912 - 1044.184, 3) }
            ],
            78: [
                { stat: 'min_basic_damage_add', value: 1065.064 }, { stat: 'max_basic_damage_add', value: round(1419.752 - 1065.064, 3) }
            ],
            79: [
                { stat: 'min_basic_damage_add', value: 1086.136 }, { stat: 'max_basic_damage_add', value: round(1447.848 - 1086.136, 3) }
            ],
            80: [
                { stat: 'min_basic_damage_add', value: 1107.4 }, { stat: 'max_basic_damage_add', value: round(1476.2 - 1107.4, 3) }
            ],
            81: [
                { stat: 'min_basic_damage_add', value: 1128.856 }, { stat: 'max_basic_damage_add', value: round(1504.808 - 1128.856, 3) }
            ],
            82: [
                { stat: 'min_basic_damage_add', value: 1150.504 }, { stat: 'max_basic_damage_add', value: round(1533.672 - 1150.504, 3) }
            ],
            83: [
                { stat: 'min_basic_damage_add', value: 1172.344 }, { stat: 'max_basic_damage_add', value: round(1562.792 - 1172.344, 3) }
            ],
            84: [
                { stat: 'min_basic_damage_add', value: 1194.376 }, { stat: 'max_basic_damage_add', value: round(1592.168 - 1194.376, 3) }
            ],
            85: [
                { stat: 'min_basic_damage_add', value: 1216.6 }, { stat: 'max_basic_damage_add', value: round(1621.8 - 1216.6, 3) }
            ],
            86: [
                { stat: 'min_basic_damage_add', value: 1239.016 }, { stat: 'max_basic_damage_add', value: round(1651.688 - 1239.016, 3) }
            ],
            87: [
                { stat: 'min_basic_damage_add', value: 1261.624 }, { stat: 'max_basic_damage_add', value: round(1681.832 - 1261.624, 3) }
            ],
            88: [
                { stat: 'min_basic_damage_add', value: 1284.424 }, { stat: 'max_basic_damage_add', value: round(1712.232 - 1284.424, 3) }
            ],
            89: [
                { stat: 'min_basic_damage_add', value: 1307.416 }, { stat: 'max_basic_damage_add', value: round(1742.888 - 1307.416, 3) }
            ],
            90: [
                { stat: 'min_basic_damage_add', value: 1330.6 }, { stat: 'max_basic_damage_add', value: round(1773.8 - 1330.6, 3) }
            ],
            91: [
                { stat: 'min_basic_damage_add', value: 1353.976 }, { stat: 'max_basic_damage_add', value: round(1804.968 - 1353.976, 3) }
            ],
            92: [
                { stat: 'min_basic_damage_add', value: 1377.544 }, { stat: 'max_basic_damage_add', value: round(1836.392 - 1377.544, 3) }
            ],
            93: [
                { stat: 'min_basic_damage_add', value: 1401.304 }, { stat: 'max_basic_damage_add', value: round(1868.072 - 1401.304, 3) }
            ],
            94: [
                { stat: 'min_basic_damage_add', value: 1425.256 }, { stat: 'max_basic_damage_add', value: round(1900.008 - 1425.256, 3) }
            ],
            95: [
                { stat: 'min_basic_damage_add', value: 1449.4 }, { stat: 'max_basic_damage_add', value: round(1932.2 - 1449.4, 3) }
            ],
            96: [
                { stat: 'min_basic_damage_add', value: 1473.736 }, { stat: 'max_basic_damage_add', value: round(1964.648 - 1473.736, 3) }
            ],
            97: [
                { stat: 'min_basic_damage_add', value: 1498.264 }, { stat: 'max_basic_damage_add', value: round(1997.352 - 1498.264, 3) }
            ],
            98: [
                { stat: 'min_basic_damage_add', value: 1522.984 }, { stat: 'max_basic_damage_add', value: round(2030.312 - 1522.984, 3) }
            ],
            99: [
                { stat: 'min_basic_damage_add', value: 1547.896 }, { stat: 'max_basic_damage_add', value: round(2063.528 - 1547.896, 3) }
            ],
            100: [
                { stat: 'min_basic_damage_add', value: 1573 }, { stat: 'max_basic_damage_add', value: round(2097 - 1573, 3) }
            ]
        },
    },
    1: {
        baseStats: [
            { stat: 'the_max_health_add', base: 192, perLevel: 44 },
            { stat: 'character_the_max_mana_add', base: 176, perLevel: 44 },
            { stat: 'dodge_add', base: 11, perLevel: 4 },
            { stat: 'trap_arm_time_add', base: TRAP_ARM_DURATION, perLevel: 0 },
            ...ALL_HEROES_BASE_STATS
        ],
        levelonlyStat: {
            1: [
                { stat: 'min_basic_damage_add', value: 25.16 }, { stat: 'max_basic_damage_add', value: round(38.32 - 25.16, 3) }
            ],
            2: [
                { stat: 'min_basic_damage_add', value: 33.64 }, { stat: 'max_basic_damage_add', value: round(55.28 - 33.64, 3) }
            ],
            3: [
                { stat: 'min_basic_damage_add', value: 42.44 }, { stat: 'max_basic_damage_add', value: round(72.88 - 42.44, 3) }
            ],
            4: [
                { stat: 'min_basic_damage_add', value: 51.56 }, { stat: 'max_basic_damage_add', value: round(91.12 - 51.56, 3) }
            ],
            5: [
                { stat: 'min_basic_damage_add', value: 61 }, { stat: 'max_basic_damage_add', value: round(110 - 61, 3) }
            ],
            6: [
                { stat: 'min_basic_damage_add', value: 70.76 }, { stat: 'max_basic_damage_add', value: round(129.52 - 70.76, 3) }
            ],
            7: [
                { stat: 'min_basic_damage_add', value: 80.84 }, { stat: 'max_basic_damage_add', value: round(149.68 - 80.84, 3) }
            ],
            8: [
                { stat: 'min_basic_damage_add', value: 91.24 }, { stat: 'max_basic_damage_add', value: round(170.48 - 91.24, 3) }
            ],
            9: [
                { stat: 'min_basic_damage_add', value: 101.96 }, { stat: 'max_basic_damage_add', value: round(191.92 - 101.96, 3) }
            ],
            10: [
                { stat: 'min_basic_damage_add', value: 113 }, { stat: 'max_basic_damage_add', value: round(214 - 113, 3) }
            ],
            11: [
                { stat: 'min_basic_damage_add', value: 124.36 }, { stat: 'max_basic_damage_add', value: round(236.72 - 124.36, 3) }
            ],
            12: [
                { stat: 'min_basic_damage_add', value: 136.04 }, { stat: 'max_basic_damage_add', value: round(260.08 - 136.04, 3) }
            ],
            13: [
                { stat: 'min_basic_damage_add', value: 148.04 }, { stat: 'max_basic_damage_add', value: round(284.08 - 148.04, 3) }
            ],
            14: [
                { stat: 'min_basic_damage_add', value: 160.36 }, { stat: 'max_basic_damage_add', value: round(308.72 - 160.36, 3) }
            ],
            15: [
                { stat: 'min_basic_damage_add', value: 173 }, { stat: 'max_basic_damage_add', value: round(334 - 173, 3) }
            ],
            16: [
                { stat: 'min_basic_damage_add', value: 185.96 }, { stat: 'max_basic_damage_add', value: round(359.92 - 185.96, 3) }
            ],
            17: [
                { stat: 'min_basic_damage_add', value: 199.24 }, { stat: 'max_basic_damage_add', value: round(386.48 - 199.24, 3) }
            ],
            18: [
                { stat: 'min_basic_damage_add', value: 212.84 }, { stat: 'max_basic_damage_add', value: round(413.68 - 212.84, 3) }
            ],
            19: [
                { stat: 'min_basic_damage_add', value: 226.76 }, { stat: 'max_basic_damage_add', value: round(441.52 - 226.76, 3) }
            ],
            20: [
                { stat: 'min_basic_damage_add', value: 226.76 }, { stat: 'max_basic_damage_add', value: round(441.52 - 226.76, 3) }
            ],
            21: [
                { stat: 'min_basic_damage_add', value: 226.76 }, { stat: 'max_basic_damage_add', value: round(441.52 - 226.76, 3) }
            ],
            22: [
                { stat: 'min_basic_damage_add', value: 226.76 }, { stat: 'max_basic_damage_add', value: round(441.52 - 226.76, 3) }
            ],
            23: [
                { stat: 'min_basic_damage_add', value: 285.64 }, { stat: 'max_basic_damage_add', value: round(559.28 - 285.64, 3) }
            ],
            24: [
                { stat: 'min_basic_damage_add', value: 301.16 }, { stat: 'max_basic_damage_add', value: round(590.32 - 301.16, 3) }
            ],
            25: [
                { stat: 'min_basic_damage_add', value: 317 }, { stat: 'max_basic_damage_add', value: round(622 - 317, 3) }
            ],
            26: [
                { stat: 'min_basic_damage_add', value: 333.16 }, { stat: 'max_basic_damage_add', value: round(654.32 - 333.16, 3) }
            ],
            27: [
                { stat: 'min_basic_damage_add', value: 349.64 }, { stat: 'max_basic_damage_add', value: round(687.28 - 349.64, 3) }
            ],
            28: [
                { stat: 'min_basic_damage_add', value: 366.44 }, { stat: 'max_basic_damage_add', value: round(720.88 - 366.44, 3) }
            ],
            29: [
                { stat: 'min_basic_damage_add', value: 383.56 }, { stat: 'max_basic_damage_add', value: round(755.12 - 383.56, 3) }
            ],
            30: [
                { stat: 'min_basic_damage_add', value: 401 }, { stat: 'max_basic_damage_add', value: round(790 - 401, 3) }
            ],
            31: [
                { stat: 'min_basic_damage_add', value: 418.76 }, { stat: 'max_basic_damage_add', value: round(825.52 - 418.76, 3) }
            ],
            32: [
                { stat: 'min_basic_damage_add', value: 436.84 }, { stat: 'max_basic_damage_add', value: round(861.68 - 436.84, 3) }
            ],
            33: [
                { stat: 'min_basic_damage_add', value: 455.24 }, { stat: 'max_basic_damage_add', value: round(898.48 - 455.24, 3) }
            ],
            34: [
                { stat: 'min_basic_damage_add', value: 473.96 }, { stat: 'max_basic_damage_add', value: round(935.92 - 473.96, 3) }
            ],
            35: [
                { stat: 'min_basic_damage_add', value: 493 }, { stat: 'max_basic_damage_add', value: round(974 - 493, 3) }
            ],
            36: [
                { stat: 'min_basic_damage_add', value: 512.36 }, { stat: 'max_basic_damage_add', value: round(1012.72 - 512.36, 3) }
            ],
            37: [
                { stat: 'min_basic_damage_add', value: 532.04 }, { stat: 'max_basic_damage_add', value: round(1052.08 - 532.04, 3) }
            ],
            38: [
                { stat: 'min_basic_damage_add', value: 552.04 }, { stat: 'max_basic_damage_add', value: round(1092.08 - 552.04, 3) }
            ],
            39: [
                { stat: 'min_basic_damage_add', value: 572.36 }, { stat: 'max_basic_damage_add', value: round(1132.72 - 572.36, 3) }
            ],
            40: [
                { stat: 'min_basic_damage_add', value: 593 }, { stat: 'max_basic_damage_add', value: round(1174 - 593, 3) }
            ],
            41: [
                { stat: 'min_basic_damage_add', value: 613.96 }, { stat: 'max_basic_damage_add', value: round(1215.92 - 613.96, 3) }
            ],
            42: [
                { stat: 'min_basic_damage_add', value: 635.24 }, { stat: 'max_basic_damage_add', value: round(1258.48 - 635.24, 3) }
            ],
            43: [
                { stat: 'min_basic_damage_add', value: 656.84 }, { stat: 'max_basic_damage_add', value: round(1301.68 - 656.84, 3) }
            ],
            44: [
                { stat: 'min_basic_damage_add', value: 678.76 }, { stat: 'max_basic_damage_add', value: round(1345.52 - 678.76, 3) }
            ],
            45: [
                { stat: 'min_basic_damage_add', value: 701 }, { stat: 'max_basic_damage_add', value: round(1390 - 701, 3) }
            ],
            46: [
                { stat: 'min_basic_damage_add', value: 723.56 }, { stat: 'max_basic_damage_add', value: round(1435.12 - 723.56, 3) }
            ],
            47: [
                { stat: 'min_basic_damage_add', value: 746.44 }, { stat: 'max_basic_damage_add', value: round(1480.88 - 746.44, 3) }
            ],
            48: [
                { stat: 'min_basic_damage_add', value: 769.64 }, { stat: 'max_basic_damage_add', value: round(1527.28 - 769.64, 3) }
            ],
            49: [
                { stat: 'min_basic_damage_add', value: 793.16 }, { stat: 'max_basic_damage_add', value: round(1574.32 - 793.16, 3) }
            ],
            50: [
                { stat: 'min_basic_damage_add', value: 817 }, { stat: 'max_basic_damage_add', value: round(1622 - 817, 3) }
            ],
            51: [
                { stat: 'min_basic_damage_add', value: 841.16 }, { stat: 'max_basic_damage_add', value: round(1670.32 - 841.16, 3) }
            ],
            52: [
                { stat: 'min_basic_damage_add', value: 865.64 }, { stat: 'max_basic_damage_add', value: round(1719.28 - 865.64, 3) }
            ],
            53: [
                { stat: 'min_basic_damage_add', value: 890.44 }, { stat: 'max_basic_damage_add', value: round(1768.88 - 890.44, 3) }
            ],
            54: [
                { stat: 'min_basic_damage_add', value: 915.56 }, { stat: 'max_basic_damage_add', value: round(1819.12 - 915.56, 3) }
            ],
            55: [
                { stat: 'min_basic_damage_add', value: 941 }, { stat: 'max_basic_damage_add', value: round(1870 - 941, 3) }
            ],
            56: [
                { stat: 'min_basic_damage_add', value: 966.76 }, { stat: 'max_basic_damage_add', value: round(1921.52 - 966.76, 3) }
            ],
            57: [
                { stat: 'min_basic_damage_add', value: 992.84 }, { stat: 'max_basic_damage_add', value: round(1973.68 - 992.84, 3) }
            ],
            58: [
                { stat: 'min_basic_damage_add', value: 1019.24 }, { stat: 'max_basic_damage_add', value: round(2026.48 - 1019.24, 3) }
            ],
            59: [
                { stat: 'min_basic_damage_add', value: 1045.96 }, { stat: 'max_basic_damage_add', value: round(2079.92 - 1045.96, 3) }
            ],
            60: [
                { stat: 'min_basic_damage_add', value: 1073 }, { stat: 'max_basic_damage_add', value: round(2134 - 1073, 3) }
            ],
            61: [
                { stat: 'min_basic_damage_add', value: 1100.36 }, { stat: 'max_basic_damage_add', value: round(2188.72 - 1100.36, 3) }
            ],
            62: [
                { stat: 'min_basic_damage_add', value: 1128.04 }, { stat: 'max_basic_damage_add', value: round(2244.08 - 1128.04, 3) }
            ],
            63: [
                { stat: 'min_basic_damage_add', value: 1156.04 }, { stat: 'max_basic_damage_add', value: round(2300.08 - 1156.04, 3) }
            ],
            64: [
                { stat: 'min_basic_damage_add', value: 1184.36 }, { stat: 'max_basic_damage_add', value: round(2356.72 - 1184.36, 3) }
            ],
            65: [
                { stat: 'min_basic_damage_add', value: 1213 }, { stat: 'max_basic_damage_add', value: round(2414 - 1213, 3) }
            ],
            66: [
                { stat: 'min_basic_damage_add', value: 1241.96 }, { stat: 'max_basic_damage_add', value: round(2471.92 - 1241.96, 3) }
            ],
            67: [
                { stat: 'min_basic_damage_add', value: 1271.24 }, { stat: 'max_basic_damage_add', value: round(2530.48 - 1271.24, 3) }
            ],
            68: [
                { stat: 'min_basic_damage_add', value: 1300.84 }, { stat: 'max_basic_damage_add', value: round(2589.68 - 1300.84, 3) }
            ],
            69: [
                { stat: 'min_basic_damage_add', value: 1330.76 }, { stat: 'max_basic_damage_add', value: round(2649.52 - 1330.76, 3) }
            ],
            70: [
                { stat: 'min_basic_damage_add', value: 1361 }, { stat: 'max_basic_damage_add', value: round(2710 - 1361, 3) }
            ],
            71: [
                { stat: 'min_basic_damage_add', value: 1391.56 }, { stat: 'max_basic_damage_add', value: round(2771.12 - 1391.56, 3) }
            ],
            72: [
                { stat: 'min_basic_damage_add', value: 1422.44 }, { stat: 'max_basic_damage_add', value: round(2832.88 - 1422.44, 3) }
            ],
            73: [
                { stat: 'min_basic_damage_add', value: 1453.64 }, { stat: 'max_basic_damage_add', value: round(2895.28 - 1453.64, 3) }
            ],
            74: [
                { stat: 'min_basic_damage_add', value: 1485.16 }, { stat: 'max_basic_damage_add', value: round(2958.32 - 1485.16, 3) }
            ],
            75: [
                { stat: 'min_basic_damage_add', value: 1517 }, { stat: 'max_basic_damage_add', value: round(3022 - 1517, 3) }
            ],
            76: [
                { stat: 'min_basic_damage_add', value: 1549.16 }, { stat: 'max_basic_damage_add', value: round(3086.32 - 1549.16, 3) }
            ],
            77: [
                { stat: 'min_basic_damage_add', value: 1581.64 }, { stat: 'max_basic_damage_add', value: round(3151.28 - 1581.64, 3) }
            ],
            78: [
                { stat: 'min_basic_damage_add', value: 1614.44 }, { stat: 'max_basic_damage_add', value: round(3216.88 - 1614.44, 3) }
            ],
            79: [
                { stat: 'min_basic_damage_add', value: 1647.56 }, { stat: 'max_basic_damage_add', value: round(3283.12 - 1647.56, 3) }
            ],
            80: [
                { stat: 'min_basic_damage_add', value: 1681 }, { stat: 'max_basic_damage_add', value: round(3350 - 1681, 3) }
            ],
            81: [
                { stat: 'min_basic_damage_add', value: 1714.76 }, { stat: 'max_basic_damage_add', value: round(3417.52 - 1714.76, 3) }
            ],
            82: [
                { stat: 'min_basic_damage_add', value: 1748.84 }, { stat: 'max_basic_damage_add', value: round(3485.68 - 1748.84, 3) }
            ],
            83: [
                { stat: 'min_basic_damage_add', value: 1783.24 }, { stat: 'max_basic_damage_add', value: round(3554.48 - 1783.24, 3) }
            ],
            84: [
                { stat: 'min_basic_damage_add', value: 1817.96 }, { stat: 'max_basic_damage_add', value: round(3623.92 - 1817.96, 3) }
            ],
            85: [
                { stat: 'min_basic_damage_add', value: 1853 }, { stat: 'max_basic_damage_add', value: round(3694 - 1853, 3) }
            ],
            86: [
                { stat: 'min_basic_damage_add', value: 1888.36 }, { stat: 'max_basic_damage_add', value: round(3764.72 - 1888.36, 3) }
            ],
            87: [
                { stat: 'min_basic_damage_add', value: 1924.04 }, { stat: 'max_basic_damage_add', value: round(3836.08 - 1924.04, 3) }
            ],
            88: [
                { stat: 'min_basic_damage_add', value: 1960.04 }, { stat: 'max_basic_damage_add', value: round(3908.08 - 1960.04, 3) }
            ],
            89: [
                { stat: 'min_basic_damage_add', value: 1996.36 }, { stat: 'max_basic_damage_add', value: round(3980.72 - 1996.36, 3) }
            ],
            90: [
                { stat: 'min_basic_damage_add', value: 2033 }, { stat: 'max_basic_damage_add', value: round(4054 - 2033, 3) }
            ],
            91: [
                { stat: 'min_basic_damage_add', value: 2069.96 }, { stat: 'max_basic_damage_add', value: round(4127.92 - 2069.96, 3) }
            ],
            92: [
                { stat: 'min_basic_damage_add', value: 2107.24 }, { stat: 'max_basic_damage_add', value: round(4202.48 - 2107.24, 3) }
            ],
            93: [
                { stat: 'min_basic_damage_add', value: 2144.84 }, { stat: 'max_basic_damage_add', value: round(4277.68 - 2144.84, 3) }
            ],
            94: [
                { stat: 'min_basic_damage_add', value: 2182.76 }, { stat: 'max_basic_damage_add', value: round(4353.52 - 2182.76, 3) }
            ],
            95: [
                { stat: 'min_basic_damage_add', value: 2221 }, { stat: 'max_basic_damage_add', value: round(4430 - 2221, 3) }
            ],
            96: [
                { stat: 'min_basic_damage_add', value: 2259.56 }, { stat: 'max_basic_damage_add', value: round(4507.12 - 2259.56, 3) }
            ],
            97: [
                { stat: 'min_basic_damage_add', value: 2298.44 }, { stat: 'max_basic_damage_add', value: round(4584.88 - 2298.44, 3) }
            ],
            98: [
                { stat: 'min_basic_damage_add', value: 2337.64 }, { stat: 'max_basic_damage_add', value: round(4663.28 - 2337.64, 3) }
            ],
            99: [
                { stat: 'min_basic_damage_add', value: 2377.16 }, { stat: 'max_basic_damage_add', value: round(4742.32 - 2377.16, 3) }
            ],
            100: [
                { stat: 'min_basic_damage_add', value: 2417 }, { stat: 'max_basic_damage_add', value: round(4822 - 2417, 3) }
            ]
        }
    },
    2: {
        baseStats: [
            { stat: 'the_max_health_add', base: 202, perLevel: 52 },
            { stat: 'character_the_max_mana_add', base: 340, perLevel: 66 },
            { stat: 'res_phy_add', base: 4, perLevel: 2 },
            { stat: 'res_mag_add', base: 7, perLevel: 3 },
            // { stat: 'health_on_kill_add', base: 3, perLevel: 0 },
            { stat: 'max_arcane_clone_add', base: 1, perLevel: 0 },
            { stat: 'arcane_bond_duration_add', base: ARCANE_BOND_DURATION, perLevel: 0 },
            { stat: 'max_emblems_add', base: MAX_EMBLEMS, perLevel: 0 },
            { stat: 'max_emblems', base: MAX_EMBLEMS, perLevel: 0 },
            { stat: 'time_lock_duration_add', base: TIME_LOCK_DURATION, perLevel: 0 },
            ...ALL_HEROES_BASE_STATS
        ],
        levelonlyStat: {
            1: [
                { stat: 'min_elemental_damage_add', value: 6.032 }, { stat: 'max_elemental_damage_add', value: round(8.048 - 6.032, 3) },
                { stat: 'min_basic_damage_add', value: 28.028 }, { stat: 'max_basic_damage_add', value: round(40.06 - 28.028, 3) }

            ],
            2: [
                { stat: 'min_elemental_damage_add', value: 8.128 }, { stat: 'max_elemental_damage_add', value: round(11.192 - 8.128, 3) },
                { stat: 'min_basic_damage_add', value: 35.112 }, { stat: 'max_basic_damage_add', value: round(55.24 - 35.112, 3) }
            ],
            3: [
                { stat: 'min_elemental_damage_add', value: 10.288 }, { stat: 'max_elemental_damage_add', value: round(14.432 - 10.288, 3) },
                { stat: 'min_basic_damage_add', value: 49.448 }, { stat: 'max_basic_damage_add', value: round(85.96 - 49.448, 3) }
            ],
            4: [
                { stat: 'min_elemental_damage_add', value: 12.512 }, { stat: 'max_elemental_damage_add', value: round(17.768 - 12.512, 3) },
                { stat: 'min_basic_damage_add', value: 42.252 }, { stat: 'max_basic_damage_add', value: round(70.54 - 42.252, 3) }
            ],
            5: [
                { stat: 'min_elemental_damage_add', value: 14.8 }, { stat: 'max_elemental_damage_add', value: round(21.2 - 14.8, 3) },
                { stat: 'min_basic_damage_add', value: 56.7 }, { stat: 'max_basic_damage_add', value: round(101.5 - 56.7, 3) }
            ],
            6: [
                { stat: 'min_elemental_damage_add', value: 17.152 }, { stat: 'max_elemental_damage_add', value: round(24.728 - 17.152, 3) },
                { stat: 'min_basic_damage_add', value: 64.008 }, { stat: 'max_basic_damage_add', value: round(117.16 - 64.008, 3) }
            ],
            7: [
                { stat: 'min_elemental_damage_add', value: 19.568 }, { stat: 'max_elemental_damage_add', value: round(28.352 - 19.568, 3) },
                { stat: 'min_basic_damage_add', value: 71.672 }, { stat: 'max_basic_damage_add', value: round(132.94 - 71.672, 3) }
            ],
            8: [
                { stat: 'min_elemental_damage_add', value: 22.048 }, { stat: 'max_elemental_damage_add', value: round(32.072 - 22.048, 3) },
                { stat: 'min_basic_damage_add', value: 78.792 }, { stat: 'max_basic_damage_add', value: round(148.84 - 78.792, 3) }
            ],
            9: [
                { stat: 'min_elemental_damage_add', value: 24.592 }, { stat: 'max_elemental_damage_add', value: round(35.888 - 24.592, 3) },
                { stat: 'min_basic_damage_add', value: 86.268 }, { stat: 'max_basic_damage_add', value: round(164.86 - 86.268, 3) }
            ],
            10: [
                { stat: 'min_elemental_damage_add', value: 27.2 }, { stat: 'max_elemental_damage_add', value: round(39.8 - 27.2, 3) },
                { stat: 'min_basic_damage_add', value: 93.8 }, { stat: 'max_basic_damage_add', value: round(181 - 93.8, 3) }
            ],
            11: [
                { stat: 'min_elemental_damage_add', value: 29.872 }, { stat: 'max_elemental_damage_add', value: round(43.808 - 29.872, 3) },
                { stat: 'min_basic_damage_add', value: 101.388 }, { stat: 'max_basic_damage_add', value: round(197.26 - 101.388, 3) }
            ],
            12: [
                { stat: 'min_elemental_damage_add', value: 32.608 }, { stat: 'max_elemental_damage_add', value: round(47.912 - 32.608, 3) },
                { stat: 'min_basic_damage_add', value: 109.032 }, { stat: 'max_basic_damage_add', value: round(213.64 - 109.032, 3) }
            ],
            13: [
                { stat: 'min_elemental_damage_add', value: 35.408 }, { stat: 'max_elemental_damage_add', value: round(52.112 - 35.408, 3) },
                { stat: 'min_basic_damage_add', value: 116.732 }, { stat: 'max_basic_damage_add', value: round(230.14 - 116.732, 3) }
            ],
            14: [
                { stat: 'min_elemental_damage_add', value: 38.272 }, { stat: 'max_elemental_damage_add', value: round(56.408 - 38.272, 3) },
                { stat: 'min_basic_damage_add', value: 124.448 }, { stat: 'max_basic_damage_add', value: round(246.76 - 124.448, 3) }
            ],
            15: [
                { stat: 'min_elemental_damage_add', value: 41.2 }, { stat: 'max_elemental_damage_add', value: round(60.8 - 41.2, 3) },
                { stat: 'min_basic_damage_add', value: 132.3 }, { stat: 'max_basic_damage_add', value: round(263.5 - 132.3, 3) }
            ],
            16: [
                { stat: 'min_elemental_damage_add', value: 44.192 }, { stat: 'max_elemental_damage_add', value: round(65.288 - 44.192, 3) },
                { stat: 'min_basic_damage_add', value: 140.168 }, { stat: 'max_basic_damage_add', value: round(280.36 - 140.168, 3) }
            ],
            17: [
                { stat: 'min_elemental_damage_add', value: 47.248 }, { stat: 'max_elemental_damage_add', value: round(69.872 - 47.248, 3) },
                { stat: 'min_basic_damage_add', value: 148.092 }, { stat: 'max_basic_damage_add', value: round(297.34 - 148.092, 3) }
            ],
            18: [
                { stat: 'min_elemental_damage_add', value: 50.368 }, { stat: 'max_elemental_damage_add', value: round(74.552 - 50.368, 3) },
                { stat: 'min_basic_damage_add', value: 156.072 }, { stat: 'max_basic_damage_add', value: round(314.44 - 156.072, 3) }
            ],
            19: [
                { stat: 'min_elemental_damage_add', value: 53.552 }, { stat: 'max_elemental_damage_add', value: round(79.328 - 53.552, 3) },
                { stat: 'min_basic_damage_add', value: 164.108 }, { stat: 'max_basic_damage_add', value: round(331.66 - 164.108, 3) }
            ],
            20: [
                { stat: 'min_elemental_damage_add', value: 56.8 }, { stat: 'max_elemental_damage_add', value: round(84.2 - 56.8, 3) },
                { stat: 'min_basic_damage_add', value: 172.2 }, { stat: 'max_basic_damage_add', value: round(349 - 172.2, 3) }
            ],
            21: [
                { stat: 'min_elemental_damage_add', value: 60.112 }, { stat: 'max_elemental_damage_add', value: round(89.168 - 60.112, 3) },
                { stat: 'min_basic_damage_add', value: 180.348 }, { stat: 'max_basic_damage_add', value: round(366.46 - 180.348, 3) }
            ],
            22: [
                { stat: 'min_elemental_damage_add', value: 63.488 }, { stat: 'max_elemental_damage_add', value: round(94.232 - 63.488, 3) },
                { stat: 'min_basic_damage_add', value: 188.552 }, { stat: 'max_basic_damage_add', value: round(384.04 - 188.552, 3) }
            ],
            23: [
                { stat: 'min_elemental_damage_add', value: 66.928 }, { stat: 'max_elemental_damage_add', value: round(99.392 - 66.928, 3) },
                { stat: 'min_basic_damage_add', value: 196.812 }, { stat: 'max_basic_damage_add', value: round(401.74 - 196.812, 3) }
            ],
            24: [
                { stat: 'min_elemental_damage_add', value: 70.432 }, { stat: 'max_elemental_damage_add', value: round(104.648 - 70.432, 3) },
                { stat: 'min_basic_damage_add', value: 205.128 }, { stat: 'max_basic_damage_add', value: round(419.56 - 205.128, 3) }
            ],
            25: [
                { stat: 'min_elemental_damage_add', value: 74 }, { stat: 'max_elemental_damage_add', value: round(110 - 74, 3) },
                { stat: 'min_basic_damage_add', value: 213.5 }, { stat: 'max_basic_damage_add', value: round(437.5 - 213.5, 3) }
            ],
            26: [
                { stat: 'min_elemental_damage_add', value: 77.632 }, { stat: 'max_elemental_damage_add', value: round(115.448 - 77.632, 3) },
                { stat: 'min_basic_damage_add', value: 221.928 }, { stat: 'max_basic_damage_add', value: round(455.56 - 221.928, 3) }
            ],
            27: [
                { stat: 'min_elemental_damage_add', value: 81.328 }, { stat: 'max_elemental_damage_add', value: round(120.992 - 81.328, 3) },
                { stat: 'min_basic_damage_add', value: 230.412 }, { stat: 'max_basic_damage_add', value: round(473.74 - 230.412, 3) }
            ],
            28: [
                { stat: 'min_elemental_damage_add', value: 85.088 }, { stat: 'max_elemental_damage_add', value: round(126.632 - 85.088, 3) },
                { stat: 'min_basic_damage_add', value: 238.952 }, { stat: 'max_basic_damage_add', value: round(492.04 - 238.952, 3) }
            ],
            29: [
                { stat: 'min_elemental_damage_add', value: 88.912 }, { stat: 'max_elemental_damage_add', value: round(132.368 - 88.912, 3) },
                { stat: 'min_basic_damage_add', value: 247.548 }, { stat: 'max_basic_damage_add', value: round(510.46 - 247.548, 3) }
            ],
            30: [
                { stat: 'min_elemental_damage_add', value: 92.8 }, { stat: 'max_elemental_damage_add', value: round(138.2 - 92.8, 3) },
                { stat: 'min_basic_damage_add', value: 256.2 }, { stat: 'max_basic_damage_add', value: round(529 - 256.2, 3) }
            ],
            31: [
                { stat: 'min_elemental_damage_add', value: 96.752 }, { stat: 'max_elemental_damage_add', value: round(144.128 - 96.752, 3) },
                { stat: 'min_basic_damage_add', value: 264.908 }, { stat: 'max_basic_damage_add', value: round(547.66 - 264.908, 3) }
            ],
            32: [
                { stat: 'min_elemental_damage_add', value: 100.768 }, { stat: 'max_elemental_damage_add', value: round(150.152 - 100.768, 3) },
                { stat: 'min_basic_damage_add', value: 273.672 }, { stat: 'max_basic_damage_add', value: round(566.44 - 273.672, 3) }
            ],
            33: [
                { stat: 'min_elemental_damage_add', value: 108.848 }, { stat: 'max_elemental_damage_add', value: round(156.272 - 108.848, 3) },
                { stat: 'min_basic_damage_add', value: 282.492 }, { stat: 'max_basic_damage_add', value: round(585.34 - 282.492, 3) }
            ],
            34: [
                { stat: 'min_elemental_damage_add', value: 108.992 }, { stat: 'max_elemental_damage_add', value: round(162.488 - 108.992, 3) },
                { stat: 'min_basic_damage_add', value: 291.368 }, { stat: 'max_basic_damage_add', value: round(604.36 - 291.368, 3) }
            ],
            35: [
                { stat: 'min_elemental_damage_add', value: 113.2 }, { stat: 'max_elemental_damage_add', value: round(168.8 - 113.2, 3) },
                { stat: 'min_basic_damage_add', value: 300.3 }, { stat: 'max_basic_damage_add', value: round(623.5 - 300.3, 3) }
            ],
            36: [
                { stat: 'min_elemental_damage_add', value: 117.472 }, { stat: 'max_elemental_damage_add', value: round(175.208 - 117.472, 3) },
                { stat: 'min_basic_damage_add', value: 309.288 }, { stat: 'max_basic_damage_add', value: round(642.76 - 309.288, 3) }
            ],
            37: [
                { stat: 'min_elemental_damage_add', value: 121.808 }, { stat: 'max_elemental_damage_add', value: round(181.712 - 121.808, 3) },
                { stat: 'min_basic_damage_add', value: 318.332 }, { stat: 'max_basic_damage_add', value: round(662.14 - 318.332, 3) }
            ],
            38: [
                { stat: 'min_elemental_damage_add', value: 126.208 }, { stat: 'max_elemental_damage_add', value: round(188.312 - 126.208, 3) },
                { stat: 'min_basic_damage_add', value: 327.432 }, { stat: 'max_basic_damage_add', value: round(681.64 - 327.432, 3) }
            ],
            39: [
                { stat: 'min_elemental_damage_add', value: 130.672 }, { stat: 'max_elemental_damage_add', value: round(195.008 - 130.672, 3) },
                { stat: 'min_basic_damage_add', value: 336.588 }, { stat: 'max_basic_damage_add', value: round(701.26 - 336.588, 3) }
            ],
            40: [
                { stat: 'min_elemental_damage_add', value: 135.2 }, { stat: 'max_elemental_damage_add', value: round(201.8 - 135.2, 3) },
                { stat: 'min_basic_damage_add', value: 345.8 }, { stat: 'max_basic_damage_add', value: round(721 - 345.8, 3) }
            ],
            41: [
                { stat: 'min_elemental_damage_add', value: 139.792 }, { stat: 'max_elemental_damage_add', value: round(208.688 - 139.792, 3) },
                { stat: 'min_basic_damage_add', value: 355.068 }, { stat: 'max_basic_damage_add', value: round(740.86 - 355.068, 3) }
            ],
            42: [
                { stat: 'min_elemental_damage_add', value: 144.448 }, { stat: 'max_elemental_damage_add', value: round(215.672 - 144.448, 3) },
                { stat: 'min_basic_damage_add', value: 364.392 }, { stat: 'max_basic_damage_add', value: round(760.84 - 364.392, 3) }
            ],
            43: [
                { stat: 'min_elemental_damage_add', value: 149.168 }, { stat: 'max_elemental_damage_add', value: round(222.752 - 149.168, 3) },
                { stat: 'min_basic_damage_add', value: 373.772 }, { stat: 'max_basic_damage_add', value: round(780.94 - 373.772, 3) }
            ],
            44: [
                { stat: 'min_elemental_damage_add', value: 153.952 }, { stat: 'max_elemental_damage_add', value: round(229.928 - 153.952, 3) },
                { stat: 'min_basic_damage_add', value: 383.208 }, { stat: 'max_basic_damage_add', value: round(801.16 - 383.208, 3) }
            ],
            45: [
                { stat: 'min_elemental_damage_add', value: 158.8 }, { stat: 'max_elemental_damage_add', value: round(237.2 - 158.8, 3) },
                { stat: 'min_basic_damage_add', value: 392.7 }, { stat: 'max_basic_damage_add', value: round(821.5 - 392.7, 3) }
            ],
            46: [
                { stat: 'min_elemental_damage_add', value: 163.712 }, { stat: 'max_elemental_damage_add', value: round(244.568 - 163.712, 3) },
                { stat: 'min_basic_damage_add', value: 402.248 }, { stat: 'max_basic_damage_add', value: round(841.96 - 402.248, 3) }
            ],
            47: [
                { stat: 'min_elemental_damage_add', value: 168.688 }, { stat: 'max_elemental_damage_add', value: round(252.032 - 168.688, 3) },
                { stat: 'min_basic_damage_add', value: 411.852 }, { stat: 'max_basic_damage_add', value: round(862.54 - 411.852, 3) }
            ],
            48: [
                { stat: 'min_elemental_damage_add', value: 173.728 }, { stat: 'max_elemental_damage_add', value: round(259.592 - 173.728, 3) },
                { stat: 'min_basic_damage_add', value: 421.512 }, { stat: 'max_basic_damage_add', value: round(883.24 - 421.512, 3) }
            ],
            49: [
                { stat: 'min_elemental_damage_add', value: 178.832 }, { stat: 'max_elemental_damage_add', value: round(267.248 - 178.832, 3) },
                { stat: 'min_basic_damage_add', value: 431.228 }, { stat: 'max_basic_damage_add', value: round(904.06 - 431.228, 3) }
            ],
            50: [
                { stat: 'min_elemental_damage_add', value: 184 }, { stat: 'max_elemental_damage_add', value: round(275 - 184, 3) },
                { stat: 'min_basic_damage_add', value: 441 }, { stat: 'max_basic_damage_add', value: round(925 - 441, 3) }
            ],
            51: [
                { stat: 'min_elemental_damage_add', value: 189.232 }, { stat: 'max_elemental_damage_add', value: round(282.848 - 189.232, 3) },
                { stat: 'min_basic_damage_add', value: 450.828 }, { stat: 'max_basic_damage_add', value: round(946.06 - 450.828, 3) }
            ],
            52: [
                { stat: 'min_elemental_damage_add', value: 194.528 }, { stat: 'max_elemental_damage_add', value: round(290.792 - 194.528, 3) },
                { stat: 'min_basic_damage_add', value: 460.712 }, { stat: 'max_basic_damage_add', value: round(967.24 - 460.712, 3) }
            ],
            53: [
                { stat: 'min_elemental_damage_add', value: 199.888 }, { stat: 'max_elemental_damage_add', value: round(298.832 - 199.888, 3) },
                { stat: 'min_basic_damage_add', value: 470.652 }, { stat: 'max_basic_damage_add', value: round(470.652 - 470.652, 3) }
            ],
            54: [
                { stat: 'min_elemental_damage_add', value: 205.312 }, { stat: 'max_elemental_damage_add', value: round(306.968 - 205.312, 3) },
                { stat: 'min_basic_damage_add', value: 480.648 }, { stat: 'max_basic_damage_add', value: round(1009.96 - 480.648, 3) }
            ],
            55: [
                { stat: 'min_elemental_damage_add', value: 210.8 }, { stat: 'max_elemental_damage_add', value: round(315.2 - 210.8, 3) },
                { stat: 'min_basic_damage_add', value: 490.7 }, { stat: 'max_basic_damage_add', value: round(1031.5 - 490.7, 3) }
            ],
            56: [
                { stat: 'min_elemental_damage_add', value: 216.352 }, { stat: 'max_elemental_damage_add', value: round(323.528 - 216.352, 3) },
                { stat: 'min_basic_damage_add', value: 500.808 }, { stat: 'max_basic_damage_add', value: round(1053.16 - 500.808, 3) }
            ],
            57: [
                { stat: 'min_elemental_damage_add', value: 221.968 }, { stat: 'max_elemental_damage_add', value: round(331.952 - 221.968, 3) },
                { stat: 'min_basic_damage_add', value: 510.972 }, { stat: 'max_basic_damage_add', value: round(1074.94 - 510.972, 3) }
            ],
            58: [
                { stat: 'min_elemental_damage_add', value: 227.648 }, { stat: 'max_elemental_damage_add', value: round(340.472 - 227.648, 3) },
                { stat: 'min_basic_damage_add', value: 521.192 }, { stat: 'max_basic_damage_add', value: round(1096.84 - 521.192, 3) }
            ],
            59: [
                { stat: 'min_elemental_damage_add', value: 233.392 }, { stat: 'max_elemental_damage_add', value: round(349.088 - 233.392, 3) },
                { stat: 'min_basic_damage_add', value: 531.468 }, { stat: 'max_basic_damage_add', value: round(1118.86 - 531.468, 3) }
            ],
            60: [
                { stat: 'min_elemental_damage_add', value: 239.2 }, { stat: 'max_elemental_damage_add', value: round(357.8 - 239.2, 3) },
                { stat: 'min_basic_damage_add', value: 541.8 }, { stat: 'max_basic_damage_add', value: round(1141 - 541.8, 3) }
            ],
            61: [
                { stat: 'min_elemental_damage_add', value: 245.072 }, { stat: 'max_elemental_damage_add', value: round(366.608 - 245.072, 3) },
                { stat: 'min_basic_damage_add', value: 552.188 }, { stat: 'max_basic_damage_add', value: round(1163.26 - 552.188, 3) }
            ],
            62: [
                { stat: 'min_elemental_damage_add', value: 251.008 }, { stat: 'max_elemental_damage_add', value: round(375.512 - 251.008, 3) },
                { stat: 'min_basic_damage_add', value: 562.632 }, { stat: 'max_basic_damage_add', value: round(1185.64 - 562.632, 3) }
            ],
            63: [
                { stat: 'min_elemental_damage_add', value: 257.008 }, { stat: 'max_elemental_damage_add', value: round(384.512 - 257.008, 3) },
                { stat: 'min_basic_damage_add', value: 573.132 }, { stat: 'max_basic_damage_add', value: round(1208.14 - 573.132, 3) }
            ],
            64: [
                { stat: 'min_elemental_damage_add', value: 263.072 }, { stat: 'max_elemental_damage_add', value: round(393.608 - 263.072, 3) },
                { stat: 'min_basic_damage_add', value: 583.688 }, { stat: 'max_basic_damage_add', value: round(1230.76 - 583.688, 3) }
            ],
            65: [
                { stat: 'min_elemental_damage_add', value: 269.2 }, { stat: 'max_elemental_damage_add', value: round(402.8 - 269.2, 3) },
                { stat: 'min_basic_damage_add', value: 594.3 }, { stat: 'max_basic_damage_add', value: round(1253.5 - 594.3, 3) }
            ],
            66: [
                { stat: 'min_elemental_damage_add', value: 275.392 }, { stat: 'max_elemental_damage_add', value: round(412.088 - 275.392, 3) },
                { stat: 'min_basic_damage_add', value: 604.968 }, { stat: 'max_basic_damage_add', value: round(1276.36 - 604.968, 3) }
            ],
            67: [
                { stat: 'min_elemental_damage_add', value: 281.648 }, { stat: 'max_elemental_damage_add', value: round(421.472 - 281.648, 3) },
                { stat: 'min_basic_damage_add', value: 615.692 }, { stat: 'max_basic_damage_add', value: round(1299.34 - 615.692, 3) }
            ],
            68: [
                { stat: 'min_elemental_damage_add', value: 287.968 }, { stat: 'max_elemental_damage_add', value: round(430.952 - 287.968, 3) },
                { stat: 'min_basic_damage_add', value: 626.472 }, { stat: 'max_basic_damage_add', value: round(1322.44 - 626.472, 3) }
            ],
            69: [
                { stat: 'min_elemental_damage_add', value: 294.352 }, { stat: 'max_elemental_damage_add', value: round(440.528 - 294.352, 3) },
                { stat: 'min_basic_damage_add', value: 637.308 }, { stat: 'max_basic_damage_add', value: round(1345.66 - 637.308, 3) }
            ],
            70: [
                { stat: 'min_elemental_damage_add', value: 300.8 }, { stat: 'max_elemental_damage_add', value: round(450.2 - 300.8, 3) },
                { stat: 'min_basic_damage_add', value: 648.2 }, { stat: 'max_basic_damage_add', value: round(1369 - 648.2, 3) }
            ],
            71: [
                { stat: 'min_elemental_damage_add', value: 307.312 }, { stat: 'max_elemental_damage_add', value: round(459.968 - 307.312, 3) },
                { stat: 'min_basic_damage_add', value: 659.148 }, { stat: 'max_basic_damage_add', value: round(1392.46 - 659.148, 3) }
            ],
            72: [
                { stat: 'min_elemental_damage_add', value: 313.888 }, { stat: 'max_elemental_damage_add', value: round(469.832 - 313.888, 3) },
                { stat: 'min_basic_damage_add', value: 313.888 }, { stat: 'max_basic_damage_add', value: round(1416.04 - 313.888, 3) }
            ],
            73: [
                { stat: 'min_elemental_damage_add', value: 320.528 }, { stat: 'max_elemental_damage_add', value: round(479.792 - 320.528, 3) },
                { stat: 'min_basic_damage_add', value: 681.212 }, { stat: 'max_basic_damage_add', value: round(1439.74 - 681.212, 3) }
            ],
            74: [
                { stat: 'min_elemental_damage_add', value: 327.232 }, { stat: 'max_elemental_damage_add', value: round(489.848 - 327.232, 3) },
                { stat: 'min_basic_damage_add', value: 692.328 }, { stat: 'max_basic_damage_add', value: round(1463.56 - 692.328, 3) }
            ],
            75: [
                { stat: 'min_elemental_damage_add', value: 334 }, { stat: 'max_elemental_damage_add', value: round(500 - 334, 3) },
                { stat: 'min_basic_damage_add', value: 703.5 }, { stat: 'max_basic_damage_add', value: round(1487.5 - 703.5, 3) }
            ],
            76: [
                { stat: 'min_elemental_damage_add', value: 510.248 }, { stat: 'max_elemental_damage_add', value: round(340.832 - 510.248, 3) },
                { stat: 'min_basic_damage_add', value: 714.728 }, { stat: 'max_basic_damage_add', value: round(1511.56 - 714.728, 3) }
            ],
            77: [
                { stat: 'min_elemental_damage_add', value: 347.728 }, { stat: 'max_elemental_damage_add', value: round(520.592 - 347.728, 3) },
                { stat: 'min_basic_damage_add', value: 726.012 }, { stat: 'max_basic_damage_add', value: round(1535.74 - 726.012, 3) }
            ],
            78: [
                { stat: 'min_elemental_damage_add', value: 354.688 }, { stat: 'max_elemental_damage_add', value: round(531.032 - 354.688, 3) },
                { stat: 'min_basic_damage_add', value: 737.352 }, { stat: 'max_basic_damage_add', value: round(1560.04 - 737.352, 3) }
            ],
            79: [
                { stat: 'min_elemental_damage_add', value: 361.712 }, { stat: 'max_elemental_damage_add', value: round(541.568 - 361.712, 3) },
                { stat: 'min_basic_damage_add', value: 748.748 }, { stat: 'max_basic_damage_add', value: round(1584.46 - 748.748, 3) }
            ],
            80: [
                { stat: 'min_elemental_damage_add', value: 368.8 }, { stat: 'max_elemental_damage_add', value: round(552.2 - 368.8, 3) },
                { stat: 'min_basic_damage_add', value: 760.2 }, { stat: 'max_basic_damage_add', value: round(1609 - 760.2, 3) }
            ],
            81: [
                { stat: 'min_elemental_damage_add', value: 375.952 }, { stat: 'max_elemental_damage_add', value: round(562.928 - 375.952, 3) },
                { stat: 'min_basic_damage_add', value: 771.708 }, { stat: 'max_basic_damage_add', value: round(1633.68 - 771.708, 3) }
            ],
            82: [
                { stat: 'min_elemental_damage_add', value: 383.168 }, { stat: 'max_elemental_damage_add', value: round(1658.44 - 383.168, 3) },
                { stat: 'min_basic_damage_add', value: 783.272 }, { stat: 'max_basic_damage_add', value: round(573.752 - 783.272, 3) }
            ],
            83: [
                { stat: 'min_elemental_damage_add', value: 390.448 }, { stat: 'max_elemental_damage_add', value: round(584.672 - 390.448, 3) },
                { stat: 'min_basic_damage_add', value: 794.892 }, { stat: 'max_basic_damage_add', value: round(1683.34 - 794.892, 3) }
            ],
            84: [
                { stat: 'min_elemental_damage_add', value: 397.792 }, { stat: 'max_elemental_damage_add', value: round(595.688 - 397.792, 3) },
                { stat: 'min_basic_damage_add', value: 806.568 }, { stat: 'max_basic_damage_add', value: round(1708.36 - 806.568, 3) }
            ],
            85: [
                { stat: 'min_elemental_damage_add', value: 405.2 }, { stat: 'max_elemental_damage_add', value: round(606.8 - 405.2, 3) },
                { stat: 'min_basic_damage_add', value: 818.3 }, { stat: 'max_basic_damage_add', value: round(1733.5 - 818.3, 3) }
            ],
            86: [
                { stat: 'min_elemental_damage_add', value: 412.672 }, { stat: 'max_elemental_damage_add', value: round(618.008 - 412.672, 3) },
                { stat: 'min_basic_damage_add', value: 830.088 }, { stat: 'max_basic_damage_add', value: round(1758.76 - 830.088, 3) }
            ],
            87: [
                { stat: 'min_elemental_damage_add', value: 420.208 }, { stat: 'max_elemental_damage_add', value: round(629.312 - 420.208, 3) },
                { stat: 'min_basic_damage_add', value: 841.932 }, { stat: 'max_basic_damage_add', value: round(1784.14 - 841.932, 3) }
            ],
            88: [
                { stat: 'min_elemental_damage_add', value: 427.808 }, { stat: 'max_elemental_damage_add', value: round(640.712 - 427.808, 3) },
                { stat: 'min_basic_damage_add', value: 853.832 }, { stat: 'max_basic_damage_add', value: round(1809.64 - 853.832, 3) }
            ],
            89: [
                { stat: 'min_elemental_damage_add', value: 435.472 }, { stat: 'max_elemental_damage_add', value: round(652.208 - 435.472, 3) },
                { stat: 'min_basic_damage_add', value: 865.788 }, { stat: 'max_basic_damage_add', value: round(1835.26 - 865.788, 3) }
            ],
            90: [
                { stat: 'min_elemental_damage_add', value: 443.2 }, { stat: 'max_elemental_damage_add', value: round(663.8 - 443.2, 3) },
                { stat: 'min_basic_damage_add', value: 877.8 }, { stat: 'max_basic_damage_add', value: round(1861 - 877.8, 3) }
            ],
            91: [
                { stat: 'min_elemental_damage_add', value: 450.992 }, { stat: 'max_elemental_damage_add', value: round(675.488 - 450.992, 3) },
                { stat: 'min_basic_damage_add', value: 889.868 }, { stat: 'max_basic_damage_add', value: round(1886.86 - 889.868, 3) }
            ],
            92: [
                { stat: 'min_elemental_damage_add', value: 458.848 }, { stat: 'max_elemental_damage_add', value: round(687.272 - 458.848, 3) },
                { stat: 'min_basic_damage_add', value: 901.848 }, { stat: 'max_basic_damage_add', value: round(1912.84 - 901.848, 3) }
            ],
            93: [
                { stat: 'min_elemental_damage_add', value: 466.768 }, { stat: 'max_elemental_damage_add', value: round(699.152 - 466.768, 3) },
                { stat: 'min_basic_damage_add', value: 914.172 }, { stat: 'max_basic_damage_add', value: round(1938.94 - 914.172, 3) }
            ],
            94: [
                { stat: 'min_elemental_damage_add', value: 474.752 }, { stat: 'max_elemental_damage_add', value: round(711.128 - 474.752, 3) },
                { stat: 'min_basic_damage_add', value: 926.408 }, { stat: 'max_basic_damage_add', value: round(1965.16 - 926.408, 3) }
            ],
            95: [
                { stat: 'min_elemental_damage_add', value: 482.8 }, { stat: 'max_elemental_damage_add', value: round(723.2 - 482.8, 3) },
                { stat: 'min_basic_damage_add', value: 938.7 }, { stat: 'max_basic_damage_add', value: round(1991.5 - 938.7, 3) }
            ],
            96: [
                { stat: 'min_elemental_damage_add', value: 490.912 }, { stat: 'max_elemental_damage_add', value: round(735.368 - 490.912, 3) },
                { stat: 'min_basic_damage_add', value: 951.048 }, { stat: 'max_basic_damage_add', value: round(2017.96 - 951.048, 3) }
            ],
            97: [
                { stat: 'min_elemental_damage_add', value: 499.088 }, { stat: 'max_elemental_damage_add', value: round(747.632 - 499.088, 3) },
                { stat: 'min_basic_damage_add', value: 963.452 }, { stat: 'max_basic_damage_add', value: round(2044.54 - 963.452, 3) }
            ],
            98: [
                { stat: 'min_elemental_damage_add', value: 507.328 }, { stat: 'max_elemental_damage_add', value: round(759.992 - 507.328, 3) },
                { stat: 'min_basic_damage_add', value: 975.912 }, { stat: 'max_basic_damage_add', value: round(2071.24 - 975.912, 3) }
            ],
            99: [
                { stat: 'min_elemental_damage_add', value: 515.632 }, { stat: 'max_elemental_damage_add', value: round(772.448 - 515.632, 3) },
                { stat: 'min_basic_damage_add', value: 988.428 }, { stat: 'max_basic_damage_add', value: round(2098.06 - 988.428, 3) }
            ],
            100: [
                { stat: 'min_elemental_damage_add', value: 524 }, { stat: 'max_elemental_damage_add', value: round(785 - 524, 3) },
                { stat: 'min_basic_damage_add', value: 1001 }, { stat: 'max_basic_damage_add', value: round(2125 - 1001, 3) }
            ]
        },
    }
};