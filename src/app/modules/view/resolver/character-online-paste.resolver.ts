import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';

import { ImportExportService } from '../../shared/services/import-export.service';
import { MessageService } from '../../shared/services/message.service';
import { OnlinePasteService } from '../../shared/services/online-paste.service';
import { Character } from '../../slormancer/model/character';
import { valueOrNull } from '../../slormancer/util/utils';

@Injectable()
export class CharacterOnlinePasteResolver implements Resolve<Character> {

    constructor(private onlinePasteService: OnlinePasteService,
                private messageService: MessageService,
                private importExportService: ImportExportService,
                private router: Router) {}

    private back() {
        this.router.navigateByUrl('/');
    }

    public resolve(route: ActivatedRouteSnapshot): Promise<Character> {
        return new Promise(() => {
            const key: string | null = valueOrNull(route.params['key']);
            if (key !== null) {
                this.onlinePasteService.getPaste(key)
                    .subscribe(
                        result => {
                            if (result) {
                                const sharedData = this.importExportService.import(result);
                                if (sharedData.character !== null) {
                                    location.href = this.importExportService.exportCharacterAsLink(sharedData.character);
                                } else {
                                    this.messageService.error('Failed to load shared character');
                                    this.back();
                                }
                            } else {
                                this.messageService.error('Failed to load shared character');
                                this.back();
                            }
                        },
                        () => {
                            this.messageService.error('Failed to load shared character');
                            this.back();
                        }
                    );
            } else {
                this.back();
            }
        })
    }
}