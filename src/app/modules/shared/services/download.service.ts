import { Injectable } from '@angular/core';

@Injectable()
export class DownloadService {
    
    constructor() {}

    public downloadFile(data: string, filename: string) {
        const a = document.createElement('a');
        const blob = new Blob([data], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
      
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }
}