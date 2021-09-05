import { ReaperEffect } from '../reaper-effect';

export interface DataReaper {
    override: (base: ReaperEffect | null, benediction: ReaperEffect | null, malediction: ReaperEffect | null, reaperId: number) => void
};

