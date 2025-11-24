import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DomSanitizer } from "@angular/platform-browser";
import { SlbDropzoneComponent } from "@slb-dls/angular-material/dropzone";
import {
  MessageService,
  SlbSeverity,
} from "@slb-dls/angular-material/notification";
import { PdfViewerDialogComponent } from "src/app/organisms/pdf-viewer-dialog/pdf-viewer-dialog.component";
import { FileUploadService } from "src/app/services/file-upload.service";
import { UploadZipFileServiceService } from "src/app/services/upload-zip-file.service.service";

@Component({
  selector: "app-button-rar-upload",
  templateUrl: "./button-rar-upload.component.html",
  styleUrls: ["./button-rar-upload.component.scss"],
})
export class ButtonRarUploadComponent {
  @Input() label: string;
  @Input() files: File[];
  @Input() extension: string;
  @Input() editDisabled: boolean = false;
  @Output() unzipDataEvent = new EventEmitter<File[]>();
  @Output() zipDataEvent = new EventEmitter<File[]>();
  @Output() dataEvent = new EventEmitter<{
    zipData: File[];
    unzipData: File[];
    unzipSigns: any[];
    response: any;
  }>();

  unzipFiles: File[] = [];
  unzipFilesSigns: any[] = [];
  fileResponse: any[];

  sendOutData(files: File[]) {
    this.unzipDataEvent.emit(files);
  }

  sendInData(files: File[]) {
    this.zipDataEvent.emit(files);
  }

  sendData(
    zipFiles: File[],
    unzipFiles: File[],
    unzipFilesSigns: any[],
    unzipResponse: any
  ) {
    this.dataEvent.emit({
      zipData: zipFiles,
      unzipData: unzipFiles,
      unzipSigns: unzipFilesSigns,
      response: unzipResponse,
    });
  }

  @ViewChild("dropzone") dropzoneComponent: SlbDropzoneComponent;
  previewType: string;
  previewSrc: string | null = null;
  progress: { [key: string]: { progress: number; completed: boolean } } = {}; // Progreso de cada archivo
  file: any;

  constructor(
    private sanitizer: DomSanitizer,
    private fileUploadService: FileUploadService,
    public dialog: MatDialog,
    private messageService: MessageService,
    private cdRef: ChangeDetectorRef,
    private uploadZipFileService: UploadZipFileServiceService
  ) {}

  downloadFile(file: File) {
    const fileUrl = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(fileUrl); // Limpiar el objeto URL después de la descarga
  }

  onFilesChange(event: any) {
    this.clearAllFiles();
    this.files = [];
    const addedFiles = event;
    for (let i = 0; i < addedFiles.length; i++) {
      const file = addedFiles[i];

      this.files.push(file);
      this.progress[file.name] = { progress: 0, completed: false };
    }
    this.uploadFiles();
  }

  uploadFiles() {
    if (this.files.length === 0) {
      return;
    }
    this.unzipFiles = [];
    this.unzipFilesSigns = [];
    this.fileResponse = [];

    for (const file of this.files) {
      this.uploadZipFileService.uploadZip(file).subscribe({
        next: (event) => {
          if (event.status === "progress") {
            const progress = event.progress ?? 0;
            this.progress[file.name].progress = progress;
            this.updateProgress();
          }
          if (event.status === "complete") {
            this.progress[file.name].completed = true;
            for (const document of event.response) {
              if (document !== null) { 
                let unzipFile = this.createPdfFile(
                  document.content,
                  document.fileName
                );
                this.unzipFiles.push(unzipFile);
                this.unzipFilesSigns.push(document.signs);
                this.fileResponse.push(document);
              } 
            }
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: SlbSeverity.Error,
            summary: "Problema en la Subida",
            detail: `Hubo un problema al subir ${file.name}. Inténtalo de nuevo.`,
          });
          this.clearAllFiles();
        },
        complete: () => {
          this.messageService.add({
            severity: SlbSeverity.Success,
            summary: "Subida Completada",
            detail: `El archivo ${file.name} se subió correctamente.`,
          });
          this.sendOutData(this.unzipFiles);
          this.sendInData(this.files);
          this.sendData(
            this.files,
            this.unzipFiles,
            this.unzipFilesSigns,
            this.fileResponse
          );
        },
      });
    }
  }

  clearAllFiles() {
    if (this.dropzoneComponent) {
      this.dropzoneComponent.clearAllFiles();
      this.files = [];
      this.unzipFiles = [];
      this.unzipFilesSigns = [];
      this.progress = {};
    }
  }

  updateProgress() {
    this.progress = { ...this.progress };
  }

  private createPdfFile(content: string, fileName: string): File {
    const byteArray = content.split(",").map((num) => parseInt(num, 10));

    const blob = new Blob([new Uint8Array(byteArray)], {
      type: "application/pdf",
    });

    const file = new File([blob], fileName, { type: "application/pdf" });

    return file;
  }
}
