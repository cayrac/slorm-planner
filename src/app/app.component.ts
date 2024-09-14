import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    public result = '';

    constructor(private router: Router,
                private titleService: Title) {
        this.updateTitleOnRouteChange();
    }

    private updateTitleOnRouteChange() {
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                const title = this.getFirstDataTitle(this.router.routerState.snapshot.root);

                if (title !== null) {
                    this.titleService.setTitle(title);
                }
            });
    }

    private getFirstDataTitle(route: ActivatedRouteSnapshot | null): string | null {
        let title: string | null = null;

        while (title === null && route !== null) {
            if (route.data && typeof route.data['title'] === 'string') {
                title = route.data['title'];
            }

            route = route.firstChild;
        }

        return title;
    }
}
