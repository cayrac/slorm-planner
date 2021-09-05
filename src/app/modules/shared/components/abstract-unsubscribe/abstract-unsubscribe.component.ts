import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({ template: '' })
export abstract class AbstractUnsubscribeComponent implements OnDestroy {

    protected readonly unsubscribe: Subject<void> = new Subject<void>()

    public ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }
}