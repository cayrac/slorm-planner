import { Component, EventEmitter, Input, Output } from '@angular/core';

import { valueOrNull } from '../../../slormancer/util/utils';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-file-upload-button',
  templateUrl: './file-upload-button.component.html',
  styleUrls: ['./file-upload-button.component.scss']
})
export class FileUploadButtonComponent {
    
    public readonly MAX_UPLOAD_FILE_SIZE_MO = 1;
    public readonly MAX_UPLOAD_FILE_SIZE = 1024 * 1024 * this.MAX_UPLOAD_FILE_SIZE_MO;
    
    @Input()
    public label: string | null = null;

    @Output()
    public upload = new EventEmitter<string>();
    
    public busy: boolean = false;

    public parsing: boolean = false;

    constructor(private messageService: MessageService) {
    }
    
    private uploadFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            var reader: FileReader | null = new FileReader();
    
            reader.onerror = () => {
                reader = null;
                reject();
            };
            reader.onloadend = () => {
                if (reader !== null && reader.result !== null) {
                    resolve(reader.result.toString());
                    reader = null;
                }
            };
    
            reader.readAsText(file);
        })
    }
    
    public startUpload(event: Event) {
        if (event.target !== null && !this.busy) {
            const files = (<HTMLInputElement>event.target).files;
            const file = files === null ? null : valueOrNull(files[0]);
            if (file !== null) {
                if (file.size <= this.MAX_UPLOAD_FILE_SIZE) {
                    this.busy = true;
                    this.uploadFile(file).then(
                        content => {
                            this.upload.emit(content);
                            this.busy = false;
                        },
                        () => {
                            this.messageService.error('Failed to upload this file');
                            this.busy = false;
                        }
                    );
                } else {
                    this.messageService.error('Cannot upload files bigger than ' + this.MAX_UPLOAD_FILE_SIZE_MO + 'Mo');
                }
            }
        }
    }
}
