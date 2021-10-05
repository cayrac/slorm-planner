import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { valueOrNull } from '../../slormancer/util/utils';

interface GetPasteResponse {
    success:boolean,
    paste: {
      sections:Array<{ contents: string }>
    }
}

@Injectable({ providedIn: 'root' })
export class OnlinePasteService {

    private readonly PASTEE_KEY = 'utkdp1fltzudjX0XZ6qkP1RAxGn7c4NaNJ90278VN';
    private readonly PASTEE_CREATE_PATH = 'https://api.paste.ee/v1/pastes';
    private readonly PASTEE_GET_PATH = 'https://api.paste.ee/v1/pastes/';

    constructor(private http: HttpClient) { }

    public createPaste(value: string): Observable<string | null> {
        const headers = new HttpHeaders()
        .append('Content-Type', 'application/json')
        .append('X-Auth-Token', this.PASTEE_KEY);
    
        const content = { sections: [ { contents : value } ] };

    return this.http.post<{ link: string }>(this.PASTEE_CREATE_PATH, content, { headers })
        .pipe(
            map(result => {
                let key: string | null = null;

                try {
                    const url = new URL(result.link);
                    const fragments = url.pathname.split('/');
                    key = <string>fragments[fragments.length - 1];
                } catch (e) { }

                return key;
            }),
            catchError(() => of(null))
        );
    }

    public getPaste(key: string): Observable<string | null> {
        const headers = new HttpHeaders()
            .append('X-Auth-Token', this.PASTEE_KEY);

        return this.http.get<GetPasteResponse>(this.PASTEE_GET_PATH + key, { headers })
            .pipe(
                map(response => response.success ? valueOrNull(response.paste.sections[0]?.contents) : null),
                catchError(() => of(null))
            );
    }
}