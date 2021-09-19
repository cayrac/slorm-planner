export interface HeroBaseStats {
    baseStats: Array<{ stat: string, base: number; perLevel: number }>;
    levelonlyStat: {
        [key: number]: Array<{ stat: string, value: number }>
    }
}