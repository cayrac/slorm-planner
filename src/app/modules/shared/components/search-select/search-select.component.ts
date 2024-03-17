import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SelectOption } from '@shared/model/select-option';
import { takeUntil } from 'rxjs';

import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';

interface FilteredSelectOption<T> {
    option: SelectOption<T>;
    filtered: boolean;
    disabled: boolean;
}

@Component({
  selector: 'app-search-select',
  templateUrl: './search-select.component.html',
  styleUrls: ['./search-select.component.scss']
})
export class SearchSelectComponent extends AbstractUnsubscribeComponent implements OnChanges {

    @Input()
    public readonly label: string | null = null;

    @Input()
    public readonly control: FormControl | null = null;

    @Input()
    public readonly options: Array<SelectOption<any>> = [];

    @Input()
    public readonly noErrorPadding: boolean = false;

    @Input()
    public readonly disabledOptions: Array<any> = [];

    @Input()
    public readonly notFoundMessage: string | null = null;

    public filteredOptions: Array<FilteredSelectOption<any>> = [];

    public search: FormControl = new FormControl('');

    public noResult: boolean = false;

    constructor() {
        super();
        this.search.valueChanges.subscribe(() => this.filter());
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (this.control !== null && changes['control'] ) {
            this.control.valueChanges
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(() =>  this.resetFilter());
        }
        this.filter();
    }

    public opened(open: boolean, input: HTMLInputElement) {
        if (open === false) {
            this.resetFilter();
        } else {
            input.focus();
        }
    }

    public resetFilter() {
        this.search.setValue('');
    }

    public filter() {
        const search: string = this.search.value.toLowerCase().trim();
        this.filteredOptions = this.options.map(option => ({
            option,
            filtered: option.label.toLowerCase().indexOf(search) === -1,
            disabled: this.disabledOptions.includes(option.value)
        }));
        this.noResult = !this.filteredOptions.some(filteredOption => !filteredOption.filtered)
    }

    public trackBy<T>(index: number, filtedOption: FilteredSelectOption<T>): T {
        return filtedOption.option.value;
    }

    public handleSearchSpace(event: Event) {
        event.stopPropagation();
    }

    public isStatInOptions(stat: string): boolean {
        return this.options.some(option => option.value === stat);
    }
}
    
