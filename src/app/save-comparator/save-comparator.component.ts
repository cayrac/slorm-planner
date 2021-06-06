import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';

import { JsonComponent } from '../component/json/json.component';
import { NEW_GAME_MAGE } from '../saves/new_game_mage';
import { NEW_GAME_MAGE_FIRST_CAST } from '../saves/new_game_mage-first-cast';
import { NEW_GAME_MAGE_FIRST_WEAPON } from '../saves/new_game_mage-first-weapon';
import { SlormancerSaveService, SlormSave } from '../slormancer';

@Component({
  selector: 'app-save-comparator',
  templateUrl: './save-comparator.component.html',
  styleUrls: ['./save-comparator.component.scss']
})
export class SaveComparatorComponent {

    public readonly SAVES = [
        { label: 'NEW_GAME_MAGE', value: NEW_GAME_MAGE },
        { label: 'NEW_GAME_MAGE_FIRST_WEAPON', value: NEW_GAME_MAGE_FIRST_WEAPON },
        { label: 'NEW_GAME_MAGE_FIRST_CAST', value: NEW_GAME_MAGE_FIRST_CAST }
    ];

    private left: SlormSave | null = null;

    private right: SlormSave | null = null;

    private selectedAttribute: string | null = null;

    @ViewChildren(JsonComponent, { read: ElementRef })
    private jsonComponents: QueryList<ElementRef>;

    constructor(private slormancerSaveService: SlormancerSaveService) {
    }

    public getAttributes(): Set<string> {
        const leftAttributes = this.left === null ? [] : Object.keys(this.left);
        const rightAttributes = this.right === null ? [] : Object.keys(this.right);

        return new Set([...leftAttributes, ...rightAttributes]);
    }

    public hasLeft(): boolean {
        return this.left !== null;
    }

    public hasRight(): boolean {
        return this.right !== null;
    }

    private initAttribute() {
        const attributes = this.getAttributes();
        if (!attributes.has(this.selectedAttribute)) {
            this.selectedAttribute = null;
        }

        if (this.selectedAttribute === null && attributes.size > 0) {
            this.selectedAttribute = Array.from(attributes)[0];
        }
    }

    public clearLeft() {
        this.left = null;
        this.initAttribute();
    }

    public clearRight() {
        this.right = null;
        this.initAttribute();
    }

    public loadLeft(file: string) {
        this.left = this.slormancerSaveService.parseSaveFile(file);
        this.initAttribute();
    }

    public loadRight(file: string) {
        this.right = this.slormancerSaveService.parseSaveFile(file);
        this.initAttribute();
    }

    public selectLeft(event: Event) {
        this.loadLeft((<HTMLSelectElement>event.target).value);
    }

    public selectRight(event:Event) {
        this.loadRight((<HTMLSelectElement>event.target).value);
    }

    public uploadLeft(file: Event) {
        this.upload((<HTMLInputElement>file.target).files[0], content => this.loadLeft(content));
    }

    public uploadRight(file: Event) {
        this.upload((<HTMLInputElement>file.target).files[0], content => this.loadRight(content));
    }

    public upload(file: File, callback: (file: string) => void) {
        var reader = new FileReader();
 
		reader.onerror = () => {
			reader = null;
            alert('Failed to upload file');
 		};
		reader.onloadend = () => {
            callback(reader.result.toString());
			reader = null;
		};
 
		reader.readAsText(file);
    }

    public setAttribute(attribute: string) {
        this.selectedAttribute = attribute;
    }

    public getAttribute(): string {
        return this.selectedAttribute;
    }

    public getLeftSaveAttributeData(): any {
        return this.selectedAttribute !== null && this.left !== null ? this.left[this.selectedAttribute] : null;
    }

    public getRightSaveAttributeData(): any {
        return this.selectedAttribute !== null && this.right !== null ? this.right[this.selectedAttribute] : null;
    }

    public hasDifferences(attribute: string): boolean {
        let hasDifferences = false;

        if (this.hasLeft() && this.hasRight()) {
            hasDifferences = JSON.stringify(this.left[attribute]) !== JSON.stringify(this.right[attribute])
        }

        return hasDifferences;
    }

    public synchronizeScrolls(event: Event) {
        const scrollLeft = (<HTMLElement>event.target).scrollLeft;
        const scrollTop = (<HTMLElement>event.target).scrollTop;

        this.jsonComponents.forEach(e => {
            const jsonElement = <HTMLElement>e.nativeElement;
            if (jsonElement.scrollLeft !== scrollLeft) {
                jsonElement.scrollLeft = scrollLeft;
            }
            if (jsonElement.scrollTop !== scrollTop) {
                jsonElement.scrollTop = scrollTop;
            }
        });
    }
}
