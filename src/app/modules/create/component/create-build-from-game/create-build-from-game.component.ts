import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { BuildService } from '../../../shared/services/build.service';
import { MessageService } from '../../../shared/services/message.service';
import { Character } from '../../../slormancer/model/character';
import { HeroClass } from '../../../slormancer/model/content/enum/hero-class';
import { GameHeroesData } from '../../../slormancer/model/parser/game/game-save';
import { SlormancerSaveParserService } from '../../../slormancer/services/parser/slormancer-save-parser.service';
import { SlormancerCharacterBuilderService } from '../../../slormancer/services/slormancer-character-builder.service';

@Component({
    selector: 'app-create-build-from-game',
    templateUrl: './create-build-from-game.component.html',
    styleUrls: ['./create-build-from-game.component.scss']
})
export class CreateBuildFromGameComponent {

    public readonly HERO_CLASSES = [HeroClass.Warrior, HeroClass.Huntress, HeroClass.Mage];
    
    public characters: GameHeroesData<Character> | null = null;

    public selectedClass: HeroClass | null = null;

    constructor(private messageService: MessageService,
                private router: Router,
                private plannerService: BuildService,
                private slormancerSaveParserService: SlormancerSaveParserService,
                private slormancerCharacterBuilderService: SlormancerCharacterBuilderService) {}
    
    public parseGameSave(content: string) {
        try {
            const gameSave = this.slormancerSaveParserService.parseSaveFile(content);
            this.characters = {
                [HeroClass.Warrior] : this.slormancerCharacterBuilderService.getCharacterFromSave(gameSave, HeroClass.Warrior),
                [HeroClass.Huntress] : this.slormancerCharacterBuilderService.getCharacterFromSave(gameSave, HeroClass.Huntress),
                [HeroClass.Mage] : this.slormancerCharacterBuilderService.getCharacterFromSave(gameSave, HeroClass.Mage)
            }
            this.selectedClass = null;
        } catch (e) {
            console.error(e);
            this.messageService.error('An error occured while parsing this save file');
        }
    }

    public getLevel(heroClass: HeroClass): string {
        let result = '';

        if (this.characters !== null) {
            result = this.characters[heroClass].level.toString();
        }

        return result;
    }

    public createBuild() {
        if (this.selectedClass !== null && this.characters !== null) {
            this.plannerService.createNewBuild(this.selectedClass, 'New build', this.characters[this.selectedClass]);
            this.router.navigate(['/build']);
        }
    }
}
