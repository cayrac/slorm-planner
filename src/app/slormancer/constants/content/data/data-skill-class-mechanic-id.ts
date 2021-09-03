import { GameHeroesData } from '../../../model/parser/game/game-save';

export const DATA_SKILL_CLASS_MECHANIC_ID: GameHeroesData<{ [key: string]: number }> = {
    0: {
        '<skewer>': 216,
        '<skewered>': 216,
        '<fortunate>': 215,
        '<perfect>': 215,
        '<block>': 218,
        '<blocking>': 218,
        '<astral retribution>': 217,
        '<astral retributions>': 217,
    },
    1: {
        '<poison>': 211,
        '<ravenous dagger>': 209,
        '<ravenous daggers>': 209,
        '<trap>': 210,
        '<tormented>': 212,
        '<delighted>': 213,
    },
    2: {
        '<arcane bond>': 216,
        '<time-lock>': 215,
        '<time-locked>': 215,
        '<emblems>': 214,
        '<emblem>': 214,
        '<remnant>': 217,
        '<remnants>': 217,
        '<temporal clone>': 219,
        '<temporal clones>': 219,
        '<arcane clone>': 218,
        '<arcane clones>': 218,
    }
}