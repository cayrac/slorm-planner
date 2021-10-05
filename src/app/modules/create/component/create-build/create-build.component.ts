import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { SharedData } from '../../../shared/model/shared-data';
import { MessageService } from '../../../shared/services/message.service';
import { Character } from '../../../slormancer/model/character';
import { HeroClass } from '../../../slormancer/model/content/enum/hero-class';
import { GameHeroesData } from '../../../slormancer/model/parser/game/game-save';
import { SlormancerSaveParserService } from '../../../slormancer/services/parser/slormancer-save-parser.service';
import { SlormancerCharacterBuilderService } from '../../../slormancer/services/slormancer-character-builder.service';
import { valueOrNull } from '../../../slormancer/util/utils';

@Component({
    selector: 'app-create-build',
    templateUrl: './create-build.component.html',
    styleUrls: ['./create-build.component.scss']
})
export class CreateBuildComponent {

    public readonly MAX_UPLOAD_FILE_SIZE_MO = 1;
    public readonly MAX_UPLOAD_FILE_SIZE = 1024 * 1024 * this.MAX_UPLOAD_FILE_SIZE_MO;

    public importContent = new FormControl(null, Validators.maxLength(this.MAX_UPLOAD_FILE_SIZE));

    public importResult: SharedData | null = null;

    public busy: boolean = false;

    public parsedGameCharacters: GameHeroesData<Character> | null = null;

    constructor(private messageService: MessageService,
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
            this.parsedGameCharacters = {
                [HeroClass.Warrior] : this.slormancerCharacterBuilderService.getCharacterFromSave(gameSave, HeroClass.Warrior),
                [HeroClass.Huntress] : this.slormancerCharacterBuilderService.getCharacterFromSave(gameSave, HeroClass.Huntress),
                [HeroClass.Mage] : this.slormancerCharacterBuilderService.getCharacterFromSave(gameSave, HeroClass.Mage)
            } 
        } catch (e) {
            console.error(e);
            this.messageService.error('An error occured while parsing this save file');
        }
    }

    public uploadGameSave(event: Event) {
        if (event.target !== null) {
            const files = (<HTMLInputElement>event.target).files;
            const file = files === null ? null : valueOrNull(files[0]);
            if (file !== null) {
                if (file.size <= this.MAX_UPLOAD_FILE_SIZE) {
                    this.uploadFile(file).then(
                        content => this.parseGameSave(content),
                        () => this.messageService.error('Failed to upload this game save file')
                    );
                } else {
                    this.messageService.error('Cannot upload files bigger than ' + this.MAX_UPLOAD_FILE_SIZE_MO + 'Mo');
                }
            }
        }
    }

    public uploadSave(event: Event, input: HTMLInputElement) {
        if (event.target !== null) {
            const files = (<HTMLInputElement>event.target).files;
            const file = files === null ? null : valueOrNull(files[0]);
            if (file !== null) {
                if (file.size <= this.MAX_UPLOAD_FILE_SIZE) {
                    // this.upload(file);
                    input.value = '';
                } else {
                    this.messageService.message('Cannot upload files bigger than ' + this.MAX_UPLOAD_FILE_SIZE_MO + 'Mo');
                }
            }
        }
    }
}
