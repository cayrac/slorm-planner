import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { MessageService } from '../../../shared/services/message.service';
import { PlannerService } from '../../../shared/services/planner.service';
import { Character } from '../../../slormancer/model/character';
import { HeroClass } from '../../../slormancer/model/content/enum/hero-class';
import { GameHeroesData } from '../../../slormancer/model/parser/game/game-save';
import { SlormancerSaveParserService } from '../../../slormancer/services/parser/slormancer-save-parser.service';
import { SlormancerCharacterBuilderService } from '../../../slormancer/services/slormancer-character-builder.service';
import { valueOrNull } from '../../../slormancer/util/utils';

@Component({
    selector: 'app-create-build-from-game',
    templateUrl: './create-build-from-game.component.html',
    styleUrls: ['./create-build-from-game.component.scss']
})
export class CreateBuildFromGameComponent {

    public readonly HERO_CLASSES = [HeroClass.Warrior, HeroClass.Huntress, HeroClass.Mage];

    public readonly MAX_UPLOAD_FILE_SIZE_MO = 1;
    public readonly MAX_UPLOAD_FILE_SIZE = 1024 * 1024 * this.MAX_UPLOAD_FILE_SIZE_MO;

    public busy: boolean = false;

    public characters: GameHeroesData<Character> | null = null;

    public selectedClass: HeroClass | null = null;

    constructor(private messageService: MessageService,
                private router: Router,
                private plannerService: PlannerService,
                private slormancerSaveParserService: SlormancerSaveParserService,
                private slormancerCharacterBuilderService: SlormancerCharacterBuilderService) {}
    
    private uploadFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            var reader: FileReader | null = new FileReader();
    
            reader.onerror = () => {
                reader = null;
                reject();
            };
            reader.onloadend = () => {
                if (reader !== null && reader.result !== null) {
                    resolve(reader.result.toString());
                    reader = null;
                }
            };
    
            reader.readAsText(file);
        })
    }

    private parseGameSave(content: string) {
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

    public uploadGameSave(event: Event) {
        if (event.target !== null && !this.busy) {
            const files = (<HTMLInputElement>event.target).files;
            const file = files === null ? null : valueOrNull(files[0]);
            if (file !== null) {
                if (file.size <= this.MAX_UPLOAD_FILE_SIZE) {
                    this.busy = true;
                    this.uploadFile(file).then(
                        content => {
                            this.parseGameSave(content);
                            this.busy = false;
                        },
                        () => {
                            this.messageService.error('Failed to upload this game save file');
                            this.busy = false;
                        }
                    );
                } else {
                    this.messageService.error('Cannot upload files bigger than ' + this.MAX_UPLOAD_FILE_SIZE_MO + 'Mo');
                }
            }
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
            this.plannerService.createNewPlanner(this.selectedClass, this.characters[this.selectedClass]);
            this.router.navigate(['/build']);
        }
    }
}
