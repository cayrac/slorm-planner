import { Component, Input } from '@angular/core';

import { MergedStat } from '../../../slormancer/model/content/character-stats';
import { Entity } from '../../../slormancer/model/entity';
import { MinMax } from '../../../slormancer/model/minmax';
import {
    SlormancerMergedStatUpdaterService,
} from '../../../slormancer/services/content/slormancer-merged-stat-updater.service';
import { SlormancerTranslateService } from '../../../slormancer/services/content/slormancer-translate.service';
import { round } from '../../../slormancer/util/math.util';

@Component({
  selector: 'app-merged-stat-view',
  templateUrl: './merged-stat-view.component.html',
  styleUrls: ['./merged-stat-view.component.scss']
})
export class MergedStatViewComponent {

    @Input()
    public readonly mergedStat: MergedStat | null = null;

    @Input()
    public readonly percent: boolean = false;

    constructor(private slormancerTranslateService: SlormancerTranslateService,
                private slormancerStatUpdaterService: SlormancerMergedStatUpdaterService) { }

    public translate(key: string): string {
        return this.slormancerTranslateService.translate(key);
    }

    public getSource(entity: Entity): string {
        let result = '';

        if ('synergy' in entity) {
            result = 'Synergy';
        } else if ('character' in entity) {
            result = 'Character';
        } else if ('skill' in entity) {
            result = 'Skill';
        } else if ('upgrade' in entity) {
            result = 'Upgrade';
        } else if ('item' in entity) {
            result = 'Item';
        } else if ('ancestralLegacy' in entity) {
            result = 'Ancestral Legacy';
        } else if ('attribute' in entity) {
            result = 'Attribute';
        } else if ('reaper' in entity) {
            result = 'Reaper';
        } else if ('activable' in entity) {
            result = 'Activable';
        } else if ('mechanic' in entity) {
            result = 'Mechanic';
        } else if ('classMechanic' in entity) {
            result = 'Class Mechanic';
        } else if ('ultimatum' in entity) {
            result = 'Ultimatum';
        }

        return result;
    }

    public getSourceName(entity: Entity): string {
        let result = '';

        if ('synergy' in entity) {
            result = entity.synergy;
        } else if ('skill' in entity) {
            result = entity.skill.nameLabel;
        } else if ('upgrade' in entity) {
            result = entity.upgrade.name;
        } else if ('item' in entity) {
            result = entity.item.name;
        } else if ('ancestralLegacy' in entity) {
            result = entity.ancestralLegacy.name;
        } else if ('attribute' in entity) {
            result = entity.attribute.attributeName;
        } else if ('reaper' in entity) {
            result = entity.reaper.name;
        } else if ('activable' in entity) {
            result = entity.activable.name;
        } else if ('mechanic' in entity) {
            result = entity.mechanic.name;
        } else if ('classMechanic' in entity) {
            result = entity.classMechanic.name;
        } else if ('ultimatum' in entity) {
            result = entity.ultimatum.title;
        }

        return result;
    }

    public valueToString(value: number | MinMax, suffix: string): string {
        return typeof value === 'number' ? round(value, 5) + suffix : round(value.min, 5) + suffix + '-' + round(value.max, 5) + suffix;
    }

    public minValueToString(value: number | MinMax, suffix: string, showSign: boolean = false): string {
        const result = round(typeof value === 'number' ? value : value.min, 5)
        return (result >= 0 && showSign ? '+' : '' ) + result + suffix;
    }

    public maxValueToString(value: number | MinMax, suffix: string, showSign: boolean = false): string {
        const result = round(typeof value === 'number' ? value : value.max, 5)
        return (result >= 0 && showSign ? '+' : '' ) + result + suffix;
    }

    public getTotalFlat(mergedStat: MergedStat): number | MinMax {
        return this.slormancerStatUpdaterService.getTotalFlat(mergedStat);
    }

    public getTotalFlatExtra(mergedStat: MergedStat): number | MinMax {
        return this.slormancerStatUpdaterService.getTotalFlatExtra(mergedStat);
    }

    public getTotalPercent(mergedStat: MergedStat): number | MinMax {
        const total = this.slormancerStatUpdaterService.addNumberValues(mergedStat.values.percent.map(v => v.value));
        const totalMax = total + this.slormancerStatUpdaterService.addNumberValues(mergedStat.values.maxPercent.map(v => v.value));

        return total !== totalMax ? { min: total, max: totalMax} : total;
    }

    public getTotalFlatPercent(mergedStat: MergedStat): string {
        const total = this.slormancerStatUpdaterService.getTotalFlatAndPercent(mergedStat);
        return this.valueToString(total, mergedStat.suffix);
    }

    public getTotal(mergedStat: MergedStat): string {
        const total = this.slormancerStatUpdaterService.getTotal(mergedStat);
        return this.valueToString(total, mergedStat.suffix);
    }

    public hasFlatValues(mergedStat: MergedStat): boolean {
        return mergedStat.values.flat.filter(v => !v.extra).length > 0 || mergedStat.values.max.filter(v => !v.extra).length > 0;
    }

    public hasFlatExtraValues(mergedStat: MergedStat): boolean {
        return mergedStat.values.flat.filter(v => v.extra).length > 0 || mergedStat.values.max.filter(v => v.extra).length > 0;
    }

    public hasPercentValues(mergedStat: MergedStat): boolean {
        return mergedStat.values.percent.length > 0 || mergedStat.values.maxPercent.length > 0;
    }

    public hasMultiplierValues(mergedStat: MergedStat): boolean {
        return mergedStat.values.multiplier.length > 0 || mergedStat.values.maxMultiplier.length > 0;
    }

    public showFormula(mergedStat: MergedStat): boolean {
        const hasFlatValues = mergedStat.values.flat.filter(v => !v.extra).length > 0 || mergedStat.values.max.filter(v => !v.extra).length > 0;
        const hasPercentValues = mergedStat.values.percent.length > 0 || mergedStat.values.maxPercent.length > 0;
        const hasMultiplierValues = mergedStat.values.multiplier.length > 0 || mergedStat.values.maxMultiplier.length > 0;
        const hasFlatExtraValues = mergedStat.values.flat.filter(v => v.extra).length > 0 || mergedStat.values.max.filter(v => v.extra).length > 0;
        const hasDiminishingResult = this.slormancerStatUpdaterService.hasDiminishingResult(mergedStat.stat);

        return (hasFlatValues ? 1 : 0)
            + (hasPercentValues ? 1 : 0)
            + (hasMultiplierValues ? 1 : 0)
            + (hasFlatExtraValues ? 1 : 0)
            + (hasDiminishingResult ? 1 : 0) >= 2;
    }

    public totalHasMinMax(mergedStat: MergedStat): boolean {
        return typeof mergedStat.total !== 'number';
    }

    public getMinFormula(mergedStat: MergedStat): string {
        let total = this.slormancerStatUpdaterService.getTotal(mergedStat);
        
        let flat = this.slormancerStatUpdaterService.getTotalFlat(mergedStat);
        let percent = this.slormancerStatUpdaterService.getTotalPercent(mergedStat);
        let multipliers = mergedStat.values.multiplier.map(mult => mult.value)
        let extra = this.slormancerStatUpdaterService.getTotalFlatExtra(mergedStat);

        flat = typeof flat === 'number' ? flat : flat.min;
        percent = typeof percent === 'number' ? percent : percent.min;
        extra = typeof extra === 'number' ? extra : extra.min;

        let formula = round(typeof total === 'number' ? total : total.min, 5) + ' = ';
        if (this.slormancerStatUpdaterService.hasDiminishingResult(mergedStat.stat)) {
            formula += '(1 - ' + [flat, percent, ...multipliers]
                .filter(v => v !== 0)
                .map(p => Math.max(0, 100 - p) / 100)
                .join(' * ')
                + ') * 100';
        } else {
            formula += 'round( ' + this.valueToString(flat, mergedStat.suffix) + [percent, ...multipliers]
                .filter(v => v !== 0)
                .map(p => ' * ' + ((p + 100) / 100))
                .join('') + ' )';
            if (extra !== 0) {
                formula += extra > 0 ? (' + ' + extra) : (' - ' + Math.abs(extra));
            }
        }
        
        return formula;
    }

    public getMaxFormula(mergedStat: MergedStat): string {
        let total = this.slormancerStatUpdaterService.getTotal(mergedStat);
        
        let flat = this.slormancerStatUpdaterService.getTotalFlat(mergedStat);
        let percent = this.slormancerStatUpdaterService.getTotalPercent(mergedStat);
        let extra = this.slormancerStatUpdaterService.getTotalFlatExtra(mergedStat);
        const multipliers = mergedStat.values.multiplier.map(mult => mult.value)

        flat = typeof flat === 'number' ? flat : flat.max;
        percent = typeof percent === 'number' ? percent : percent.max;
        extra = typeof extra === 'number' ? extra : extra.max;

        let formula = round(typeof total === 'number' ? total : total.max, 5) + ' = ';
        formula += 'round( ' + this.valueToString(flat, mergedStat.suffix) + [percent, ...multipliers]
            .filter(v => v !== 0)
            .map(p => ' * ' + ((p + 100) / 100))
            .join('') + ' )'; 

        if (extra !== 0) {
            formula += extra > 0 ? (' + ' + extra) : (' - ' + Math.abs(extra));
        }

        return formula;
    }
}