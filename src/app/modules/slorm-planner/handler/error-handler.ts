import { ErrorHandler, Injectable } from "@angular/core";
import { BuildStorageService } from "@shared/services/build-storage.service";


@Injectable()
export class BuildErrorHandler implements ErrorHandler {

    constructor(private buildStorageService: BuildStorageService) { }

    public handleError(error: any) {
        console.log('caught error : ', error);
        this.buildStorageService.pushCrashReport(error);
    }
}