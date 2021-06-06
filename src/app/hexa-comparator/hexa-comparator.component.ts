import { Component } from '@angular/core';

import { NEW_GAME_MAGE } from '../saves/new_game_mage';
import { Bytes, SlormancerSaveService, SlormSave } from '../slormancer';
import { BytesService } from './services/bytes.service';

@Component({
  selector: 'app-hexa-comparator',
  templateUrl: './hexa-comparator.component.html',
  styleUrls: ['./hexa-comparator.component.scss']
})
export class HexaComparatorComponent {

    public error: boolean = false;
    public loading: boolean = false;

    public slormSave: SlormSave | null = null;
    public slormBytes: Bytes | null = null;

    public selectionMin: number = -1;
    public selectionMax: number = -1;

    constructor(private slormSaveService: SlormancerSaveService,
                private bytesService: BytesService) {
        this.initLoader(NEW_GAME_MAGE);
    }

    private initLoader(save: string) {
        this.error = false;
        this.loading = false;
        
        this.slormSave = this.slormSaveService.parseSaveFile(save);
        this.slormBytes = this.bytesService.stringToBytes(save);
    }

    public reset() {
        this.slormSave = null;
        this.slormBytes = null;
        this.selectionMin = -1;
        this.selectionMax = -1;
    }

    public loadSave(file) {
        console.log(file);
        this.loading = true;
        this.error = false;
        this.slormSave = null;

        var reader = new FileReader();
 
		reader.onerror = () => {
			reader = null;
            this.error = true;
            this.loading = false;
 		};
		reader.onloadend = () => {
            this.initLoader(reader.result.toString());
			reader = null;
		};
 
		reader.readAsText(file.files[0]);
    }

    public showLoading(): boolean {
        return this.loading;
    }

    public showError(): boolean {
        return this.error;
    }

    public showSave(): boolean {
        return this.loading === false && this.slormSave !== null;
    }
}
