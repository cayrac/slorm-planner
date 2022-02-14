export enum SkillCostType {
    Life = 'life',
    LifeSecond = 'life_second',
    LifeLock = 'life_lock_flat',
    LifePercent = 'life_lock',
    Mana = 'mana',
    ManaSecond = 'mana_second',
    ManaLock = 'mana_lock_flat',
    ManaPercent = 'mana_lock',
    None = 'none'
}

export const ALL_SKILL_COST_TYPES = [
    SkillCostType.Life,
    SkillCostType.LifeSecond,
    SkillCostType.LifeLock,
    SkillCostType.LifePercent,
    SkillCostType.Mana,
    SkillCostType.ManaSecond,
    SkillCostType.ManaLock,
    SkillCostType.ManaPercent,
    SkillCostType.None,
]