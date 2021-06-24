import { ReaperSmith } from './enum/reaper-smith';

export interface ReaperEnchantment {
    type: ReaperSmith;
    values: { [key: number] : number },
    value: number;
    name: string;
    icon: string;
}