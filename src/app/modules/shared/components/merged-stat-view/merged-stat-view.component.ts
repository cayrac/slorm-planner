import { Component, Input } from '@angular/core';
import {
    Entity,
    MergedStat,
    MinMax,
    numberToString,
    round,
    SlormancerMergedStatUpdaterService,
    SlormancerTranslateService,
} from '@slorm-api';

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
        } else if ('rune' in entity) {
            result = 'Rune';
        } else if ('might' in entity) {
            result = 'Might';
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
        } else if ('rune' in entity) {
            result = entity.rune.name;
        } else if ('might' in entity) {
            result = entity.might;
        }

        return result;
    }

    public valueToString(value: number | MinMax, suffix: string): string {
        return typeof value === 'number' ? numberToString(round(value, 5)) + suffix : numberToString(round(value.min, 5)) + suffix + '-' + numberToString(round(value.max, 5)) + suffix;
    }

    public minValueToString(value: number | MinMax, suffix: string, showSign: boolean = false): string {
        const result = round(typeof value === 'number' ? value : value.min, 5)
        return (result >= 0 && showSign ? '+' : '') + numberToString(result) + suffix;
    }

    public maxValueToString(value: number | MinMax, suffix: string, showSign: boolean = false): string {
        const result = round(typeof value === 'number' ? value : value.max, 5)
        return (result >= 0 && showSign ? '+' : '') + numberToString(result) + suffix;
    }

    public getTotalFlat(mergedStat: MergedStat): number | MinMax {
        return this.slormancerStatUpdaterService.getTotalFlat(mergedStat);
    }

    public getTotalFlatExtra(mergedStat: MergedStat): number | MinMax {
        return this.slormancerStatUpdaterService.getTotalFlatExtra(mergedStat);
    }

    public getTotalFlatSynergy(mergedStat: MergedStat): number | MinMax {
        return this.slormancerStatUpdaterService.getTotalFlatSynergy(mergedStat);
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
        const total = this.slormancerStatUpdaterService.getTotal(mergedStat, true);
        return this.valueToString(total, mergedStat.suffix);
    }

    public hasFlatValues(mergedStat: MergedStat): boolean {
        return mergedStat.values.flat.filter(v => !v.extra && !v.synergy).length > 0 || mergedStat.values.max.filter(v => !v.extra).length > 0;
    }

    public hasFlatExtraValues(mergedStat: MergedStat): boolean {
        return mergedStat.values.flat.filter(v => v.extra).length > 0 || mergedStat.values.max.filter(v => v.extra).length > 0;
    }

    public hasFlatSynergyValues(mergedStat: MergedStat): boolean {
        return mergedStat.values.flat.filter(v => v.synergy).length > 0;
    }

    public hasMultiplierValues(mergedStat: MergedStat): boolean {
        return mergedStat.values.multiplier.filter(v => !v.extra).length > 0 || mergedStat.values.maxMultiplier.filter(v => !v.extra).length > 0;
    }

    public hasMultipliersExtraValues(mergedStat: MergedStat): boolean {
        return mergedStat.values.multiplier.filter(v => v.extra).length > 0 || mergedStat.values.maxMultiplier.filter(v => v.extra).length > 0;
    }

    public hasPercentValues(mergedStat: MergedStat): boolean {
        return mergedStat.values.percent.length > 0 || mergedStat.values.maxPercent.length > 0;
    }

    public showFormula(mergedStat: MergedStat): boolean {
        return (this.hasFlatValues(mergedStat) ? 1 : 0)
            + (this.hasFlatExtraValues(mergedStat) ? 1 : 0)
            + (this.hasFlatSynergyValues(mergedStat) ? 1 : 0)
            + (this.hasPercentValues(mergedStat) ? 1 : 0)
            + (this.hasMultiplierValues(mergedStat) ? 1 : 0)
            + (this.hasMultipliersExtraValues(mergedStat) ? 1 : 0)
            + (this.slormancerStatUpdaterService.hasDiminishingResult(mergedStat.stat) ? 1 : 0) >= 2;
    }

    public totalHasMinMax(mergedStat: MergedStat): boolean {
        return typeof mergedStat.total !== 'number';
    }

    private toMultipliersFormula(multipliers: number[]): string {
        return multipliers
            .filter(v => v !== 0)
            .map(p => ' * ' + ((p + 100) / 100))
            .join('')
    }

    public getMinFormula(mergedStat: MergedStat): string {
        let total = this.slormancerStatUpdaterService.getTotal(mergedStat, false);
        
        let flat = this.slormancerStatUpdaterService.getTotalFlat(mergedStat);
        let percent = this.slormancerStatUpdaterService.getTotalPercent(mergedStat);
        let multipliers = mergedStat.values.multiplier.filter(mult => !mult.extra).map(mult => mult.value)
        let extraMultipliers = mergedStat.values.multiplier.filter(mult => mult.extra).map(mult => mult.value)
        let extra = this.slormancerStatUpdaterService.getTotalFlatExtra(mergedStat);
        let synergy = this.slormancerStatUpdaterService.getTotalFlatSynergy(mergedStat);

        flat = typeof flat === 'number' ? flat : flat.min;
        percent = typeof percent === 'number' ? percent : percent.min;
        extra = typeof extra === 'number' ? extra : extra.min;
        synergy = typeof synergy === 'number' ? synergy : synergy.min;

        let formula: string;
        if (this.slormancerStatUpdaterService.hasDiminishingResult(mergedStat.stat)) {
            formula = '( 1 - ' + [flat, percent, ...multipliers, ...extraMultipliers]
                .filter(v => v !== 0)
                .map(p => round(Math.max(0, 100 - p) / 100, 4))
                .join(' * ')
                + ') * 100';
        } else {
            formula = this.valueToString(flat, mergedStat.suffix) +  this.toMultipliersFormula([percent, ...multipliers])

            if (extra !== 0) {
                formula = '(' + formula + ') ' + (extra > 0 ? ('+ ' + extra) : ('- ' + Math.abs(extra)));
            }
            if (extraMultipliers.length > 0) {
                formula = '(' + formula + ')' + this.toMultipliersFormula(extraMultipliers);
            }
            if (synergy !== 0) {
                formula = '(' + formula + ') ' + (synergy > 0 ? ('+ ' + synergy) : ('- ' + Math.abs(synergy)));
            }

            formula = 'round(' + formula + ')';
        }

        let result = round(typeof total === 'number' ? total : total.min, 5) + ' = ' + this.suroundWitMmax(mergedStat, formula);
        return result;
    }

    public getMaxFormula(mergedStat: MergedStat): string {
        let total = this.slormancerStatUpdaterService.getTotal(mergedStat, true);
        
        let flat = this.slormancerStatUpdaterService.getTotalFlat(mergedStat);
        let percent = this.slormancerStatUpdaterService.getTotalPercent(mergedStat);
        let extra = this.slormancerStatUpdaterService.getTotalFlatExtra(mergedStat);
        let synergy = this.slormancerStatUpdaterService.getTotalFlatSynergy(mergedStat);
        const multipliers = mergedStat.values.multiplier.filter(mult => !mult.extra).map(mult => mult.value)
        let extraMultipliers = mergedStat.values.multiplier.filter(mult => mult.extra).map(mult => mult.value)

        flat = typeof flat === 'number' ? flat : flat.max;
        percent = typeof percent === 'number' ? percent : percent.max;
        extra = typeof extra === 'number' ? extra : extra.max;
        synergy = typeof synergy === 'number' ? synergy : synergy.max;

        let result = round(typeof total === 'number' ? total : total.max, 5) + ' = ';
        
        let formula = this.valueToString(flat, mergedStat.suffix) +  this.toMultipliersFormula([percent, ...multipliers])

        if (extra !== 0) {
            formula = '(' + formula + ') ' + (extra > 0 ? ('+ ' + extra) : ('- ' + Math.abs(extra)));
        }
        if (extraMultipliers.length > 0) {
            formula = '(' + formula + ')' + this.toMultipliersFormula(extraMultipliers);
        }
        if (synergy !== 0) {
            formula = '(' + formula + ') ' + (synergy > 0 ? ('+ ' + synergy) : ('- ' + Math.abs(synergy)));
        }

        result += this.suroundWitMmax(mergedStat, 'round(' + formula + ')');

        return result;
    }

    public hasDisplayPrecision(mergedStat: MergedStat): boolean {
        return mergedStat.totalDisplayed !== mergedStat.total;
    }

    private suroundWitMmax(mergedStat: MergedStat, value: string): string {
        if (typeof mergedStat.maximum === 'number') {
            value = 'min(' + mergedStat.maximum + ', ' + value + ')';
        }
        return value;
    }
}