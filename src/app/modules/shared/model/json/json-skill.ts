export interface JsonSkill {
    id: number;
    rank: number;
    upgrades: Array<{ id: number; rank: number; selected: number }>;
}