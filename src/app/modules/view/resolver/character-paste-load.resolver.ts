import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';

import { ImportExportService } from '../../shared/services/import-export.service';
import { Character } from '../../slormancer/model/character';
import { valueOrNull } from '../../slormancer/util/utils';

@Injectable()
export class CharacterPasteLoad implements Resolve<Character> {

    constructor(private importExportService: ImportExportService, private router: Router) {}

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
                            this.back();
                        }
                    });
            } else {
                this.back();
            }
        })
    }
}