import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { ImportExportService } from '@shared/services/import-export.service';
import { MessageService } from '@shared/services/message.service';
import { Character, valueOrNull } from 'slormancer-api';

@Injectable()
export class CharacterPathResolver implements Resolve<Character> {

    constructor(private importExportService: ImportExportService,
                private messageService: MessageService,
                private router: Router) {}

    private back() {
        this.router.navigateByUrl('/');
    }

    public resolve(route: ActivatedRouteSnapshot): Promise<Character> {
        return new Promise(resolve => {
            const key: string | null = valueOrNull(route.params['key']);
            if (key !== null) {
                const sharedData = this.importExportService.import(key);
                if (sharedData.character !== null) {
                    resolve(sharedData.character);
                } else {
                    this.messageService.error('Failed to load shared character');
                    this.back();
                }
            } else {
                this.back();
            }
        })
    }
}