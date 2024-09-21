import { Injectable } from '@angular/core';
import { Character, CharacterMight } from '../../model';
import { round } from '../../util';

@Injectable()
export class SlormancerMightService {

    private readonly MIGHT_MAX_DAMAGE = 4000;

    private readonly MIGHT_COEFFICIENT = - 7.5 * Math.LN2;

    private getInvestedSkillSlorm(character: Character) {
        let invested = 0;
        for(const skill of character.skills) {
            for (const upgrade of skill.upgrades) {
                invested += upgrade.investedSlorm;
            }
        }
        return invested;
    }

    private getTotalSkillSlorm(character: Character) {
        let total = 0;
        for(const skill of character.skills) {
            for (const upgrade of skill.upgrades) {
                total += upgrade.totalSlormCost;
            }
        }

        return total;
    }

    private getInvestedAncestralSlorm(character: Character) {
        let invested = 0;
        for(const ancestralLegacy of character.ancestralLegacies.ancestralLegacies) {
            invested += ancestralLegacy.investedSlorm;
        }
        return invested;
    }

    private getTotalAncestralSlorm(character: Character) {
        let total = 0;
        for(const ancestralLegacy of character.ancestralLegacies.ancestralLegacies) {
            total += ancestralLegacy.totalSlormCost;
        }

        return total;
    }

    private computeMight(totalSlorm: number, investedSlorm: number): number {
        let result = 0

        /* original formula
        const k = 7.5 * Math.LN2 / totalSlorm;
        const exponent = -k * totalSlorm;
        const denominator = 1 - Math.exp(exponent);
        const m = 1 / denominator;

        const damage = maxDamage * m * (1 - Math.exp(-k * investedSlorm));

        //if we need the next point cost

        const nextDamage = damage + 1;
        const requiredSkillpoints = - Math.log(1 - nextDamage / (maxDamage * m)) / k;
        const pointToMight = requiredSkillpoints - investedSlorm;
        */
        
        if (totalSlorm > 0) {
            result = round(this.MIGHT_MAX_DAMAGE * (1 - Math.exp(this.MIGHT_COEFFICIENT * investedSlorm / totalSlorm)) / (1 - Math.exp(this.MIGHT_COEFFICIENT) ), 2);
        }

        return result;
    }

    public forceMight(character: Character, might: CharacterMight) {
        character.might = { ...might };
    }

    public updateMight(character: Character) {
        character.might.skill = this.getSkillMight(character);
        character.might.ancestral = this.getAncestralMight(character);
    }
  
    private getSkillMight(character: Character): number {
        const totalSlorm = this.getTotalSkillSlorm(character);
        const investedSlorm = this.getInvestedSkillSlorm(character);
        return this.computeMight(totalSlorm, investedSlorm);
    }

    private getAncestralMight(character: Character): number {
        const totalSlorm = this.getTotalAncestralSlorm(character);
        const investedSlorm = this.getInvestedAncestralSlorm(character);
        return this.computeMight(totalSlorm, investedSlorm);
    }
}