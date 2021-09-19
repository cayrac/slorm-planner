export interface HeroBaseStats {
    baseStats: Array<{ stat: string, value: number }>
    statsPerLevel: Array<{ stat: string, value: number }>
    levelonlyStat: {
        [key: number]: Array<{ stat: string, value: number }>
    }
}