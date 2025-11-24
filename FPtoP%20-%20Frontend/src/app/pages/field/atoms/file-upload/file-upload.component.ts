import { Component,Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FileUploadService } from './file-upload.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
})
export class FieldFileUploadComponent {
  @Input() label: string = 'Upload'; 
  @Input() idOilFielOperations: any;
  @Input() modifiedby: any;
  @Output() uploadSuccess = new EventEmitter<void>(); 
  @ViewChild('fileInput') fileInput: ElementRef; 
  selectedFile: File | null = null;

  constructor(
    private fileUploadService: FileUploadService,
    private snackBar: MatSnackBar
  ) {}

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.onUpload();
    }
  }

  onUpload() {
    if (this.selectedFile) {
      this.fileUploadService.uploadFile(this.selectedFile,this.idOilFielOperations, this.modifiedby).subscribe(
        (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            console.log('Upload progress: ' + Math.round((100 * event.loaded) / event.total) + '%');
          } else if (event.type === HttpEventType.Response) {
            this.snackBar.open('File uploaded successfully!', 'Close', {
              duration: 3000,
            });
            this.uploadSuccess.emit(); 
            console.log('Response:', event.body);
          }
        },
        (error) => {
          this.snackBar.open('File upload failed!', 'Close', {
            duration: 3000,
          });
          console.error('Upload error:', error);
        }
      );
    }
  }
}
