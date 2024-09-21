export enum SkillCostType {
    Life = 'life',
    LifeSecond = 'life_second',
    LifeLockFlat = 'life_lock_flat',
    LifeLock = 'life_lock',
    LifePercent = 'life_percent',
    Mana = 'mana',
    ManaSecond = 'mana_second',
    ManaLockFlat = 'mana_lock_flat',
    ManaLock = 'mana_lock',
    ManaPercent = 'mana_percent',
    None = 'none'
}

export const ALL_SKILL_COST_TYPES = [
    SkillCostType.Life,
    SkillCostType.LifeSecond,
    SkillCostType.LifeLockFlat,
    SkillCostType.LifeLock,
    SkillCostType.LifePercent,
    SkillCostType.Mana,
    SkillCostType.ManaSecond,
    SkillCostType.ManaLock,
    SkillCostType.ManaLockFlat,
    SkillCostType.ManaPercent,
    SkillCostType.None,
];

export const LIFE_SKILL_COST_TYPES = [
    SkillCostType.Life,
    SkillCostType.LifeSecond,
    SkillCostType.LifeLockFlat,
    SkillCostType.LifeLock,
    SkillCostType.LifePercent,
];

export const MANA_SKILL_COST_TYPES = [
    SkillCostType.Mana,
    SkillCostType.ManaSecond,
    SkillCostType.ManaLock,
    SkillCostType.ManaLockFlat,
    SkillCostType.ManaPercent,
];