import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BuildStorageService } from '@shared/services/build-storage.service';
import { BuildService } from '@shared/services/build.service';
import { MessageService } from '@shared/services/message.service';
import {
  Character,
  CharacterConfig,
  DEFAULT_CONFIG,
  GameHeroesData,
  HeroClass,
  SlormancerCharacterBuilderService,
  SlormancerSaveParserService,
} from '@slorm-api';

import { ClipboardService } from '../../services/clipboard.service';
import { ImportExportService } from '../../services/import-export.service';

@Component({
    selector: 'app-create-build-from-game',
    templateUrl: './create-build-from-game.component.html',
    styleUrls: ['./create-build-from-game.component.scss']
})
export class CreateBuildFromGameComponent {

    public readonly HERO_CLASSES = [HeroClass.Warrior, HeroClass.Huntress, HeroClass.Mage];

    @Output()
    public readonly created = new EventEmitter();

    @Input()
    public readonly name: string = 'Default name';
    
    public characters: GameHeroesData<Character> | null = null;

    public config: Partial<CharacterConfig> | null = null;

    public selectedClass: HeroClass | null = null;

    constructor(private messageService: MessageService,
                private buildStorageService: BuildStorageService,
                private buildService: BuildService,
                private slormancerSaveParserService: SlormancerSaveParserService,
                private slormancerCharacterBuilderService: SlormancerCharacterBuilderService,
                private importExportService: ImportExportService,
                private clipboardService: ClipboardService) {}
    
    public parseGameSave(content: string) {
        try {
            const gameSave = this.slormancerSaveParserService.parseSaveFile(content);
            this.characters = {
                [HeroClass.Warrior] : this.slormancerCharacterBuilderService.getCharacterFromSave(gameSave, HeroClass.Warrior),
                [HeroClass.Huntress] : this.slormancerCharacterBuilderService.getCharacterFromSave(gameSave, HeroClass.Huntress),
                [HeroClass.Mage] : this.slormancerCharacterBuilderService.getCharacterFromSave(gameSave, HeroClass.Mage)
            }
            this.config = this.slormancerCharacterBuilderService.getConfigFromSave(gameSave);
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
            const config = this.config === null ? DEFAULT_CONFIG : { ...DEFAULT_CONFIG, ...this.config };
            const build = this.buildService.createBuildWithCharacter(this.name, 'New layer', this.characters[this.selectedClass], config);
            this.buildStorageService.addBuild(build);
            this.created.emit();
        }
    }

    public copyExternalLink() {
        if (this.selectedClass !== null && this.characters !== null) {
            let configuration = DEFAULT_CONFIG;
            if (this.config !== null) {
                configuration = { ...configuration, ...this.config }
            }
            const link = this.importExportService.exportCharacterAsLink(this.characters[this.selectedClass], configuration);
            if (this.clipboardService.copyToClipboard(link)) {
                this.messageService.message('Link copied to clipboard');
            } else {
                this.messageService.error('Failed to copy link to clipboard');
            }
        }
    }
}
