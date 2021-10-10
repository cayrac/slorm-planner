import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { PlannerService } from '../../../shared/services/planner.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent extends AbstractUnsubscribeComponent implements OnInit {

    public config: FormGroup | null = null;

    constructor(private plannerService: PlannerService) {
        super();
    }

    public ngOnInit() {
        this.config = this.generateConfigurationForm();

        this.config.valueChanges
            .subscribe(() => this.updateConfiguration())

    }

    private generateConfigurationForm() {
        return new FormGroup({});
    }

    private updateConfiguration() {

        this.plannerService.updateAllCharacters();
    }
}
