import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';

import { ContentBlockedModalComponent } from '../../shared/components/content-blocked-modal/content-blocked-modal.component';
import { ImportExportService } from '../../shared/services/import-export.service';
import { MessageService } from '../../shared/services/message.service';
import { Character } from '../../slormancer/model/character';
import { valueOrNull } from '../../slormancer/util/utils';

@Injectable()
export class CharacterPasteLoad implements Resolve<Character> {

    constructor(private importExportService: ImportExportService,
                private messageService: MessageService,
                private dialog: MatDialog,
                private router: Router) {}

    private back() {
        this.router.navigateByUrl('/');
    }

    public resolve(route: ActivatedRouteSnapshot): Promise<Character> {
        return new Promise(resolve => {
            const key: string | null = valueOrNull(route.params['key']);
            if (key !== null) {
                this.importExportService.importFromOnlinePaste(key)
                    .then(sharedData => {
                        if (sharedData.character !== null) {
                            resolve(sharedData.character);
                        } else {
                            this.messageService.error('Failed to load shared character');
                            this.back();
                        }
                    }, (error: HttpErrorResponse) => {
                        if (!error.ok && error.status === 0) {
                            this.messageService.error('The shared data loading has been blocked', 'Why ?', () => this.dialog.open(ContentBlockedModalComponent));
                        } else {
                            this.messageService.error('Failed to load shared character');
                        }
                        this.back();
                    });
            } else {
                this.back();
            }
        })
    }
}