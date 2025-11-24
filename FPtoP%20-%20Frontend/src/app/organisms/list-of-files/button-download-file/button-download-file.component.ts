import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button-download-file',
  templateUrl: './button-download-file.component.html',
  styleUrls: ['./button-download-file.component.css'],
})
export class ButtonDownloadFileComponent {
  @Input() file: File;
  downloadFile(file: File) {
    const fileUrl = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(fileUrl);
  }
}
