import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ButtonRarUploadComponent } from "src/app/atoms/button-rar-upload/button-rar-upload.component";
import { RarFilesModalDialogComponent } from "src/app/atoms/rar-files-modal-dialog/rar-files-modal-dialog.component";
import { GlobalZipModalDialogComponent } from "src/app/atoms/global-zip-modal-dialog/global-zip-modal-dialog.component";

@Component({
  selector: "app-load-rar-files",
  templateUrl: "./load-rar-files.component.html",
  styleUrls: ["./load-rar-files.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class LoadRarFilesComponent {
  @Input() label: string;
  @Input() extension: string;
  @Input() editDisabled: boolean = false;
  @Input() item: any;
  @Input() elementList: any;
  @Input() itemIndex: number;
  @Input() isSharedZipFile: boolean = false;
  @Input() serialsMap: Map<string, any[]>;
  @Input() inspectionOitsMap: Map<string, any[]>;
  @Input() repairOitsMap: Map<string, any[]>;
  @Output() dialogEvent = new EventEmitter<any>();
  @ViewChild("uploadZip") uploadZip: ButtonRarUploadComponent;

  files: File[];
  unzipFiles: File[];
  zipFiles: File[];
  response: any;
  unzipFilesSigns: any[];

  constructor(public dialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.dialog.open(RarFilesModalDialogComponent, {
      width: "100%",
      height: "100%",
      maxWidth: "none",
      data: {
        zipFiles: this.zipFiles,
        unzipFiles: this.unzipFiles,
        unzipFilesSigns: this.unzipFilesSigns,
        response: this.response,
        item: this.item,
        itemIndex: this.itemIndex,
      },
      panelClass: "custom-modalbox",
    });
    console.log(`El item ${this.item}, tiene el index ${this.itemIndex}`)
    dialogRef.beforeClosed().subscribe(result => {
      if (result && Array.isArray(result)) {
        for (const file of result) {
          const selectedOption = file.selectedOption?.value;

          if (!selectedOption) continue;

          const option = this.item.documentsOfElement.find(
            (opt: any) => opt.idStandardElementsRequiredFiles === selectedOption.idStandardElementsRequiredFiles
          );

          if (option) {
            if (!option.multipleFiles) {
              option.savedFilesMetaData = [file.metadata];
              option.filesSaved = [file.metadata];
            } else {
              option.savedFilesMetaData = option.savedFilesMetaData || [];
              option.savedFilesMetaData.push(file.metadata);
              option.filesSaved = option.filesSaved || [];
              option.filesSaved.push(file.metadata);
            }
          }
        }
      }
      this.dialogEvent.emit(result);
    });
  }

  openSharedZipDialog() {
    const dialogRef = this.dialog.open(GlobalZipModalDialogComponent, {
      width: "100%",
      height: "100%",
      maxWidth: "none",
      data: {
        unzipFiles: this.unzipFiles,
        zipFiles: this.zipFiles,
        elementList: this.elementList,
        unzipFilesSigns: this.unzipFilesSigns,
        serialsMap: this.serialsMap,
        inspectionOitsMap: this.inspectionOitsMap,
        repairOitsMap: this.repairOitsMap,
      },
      panelClass: "custom-modalbox",
    });
    dialogRef.beforeClosed().subscribe(result => {
      if (result && Array.isArray(result)) {
        for (const fileMapping of result) {
          const selectedOption = fileMapping.selectedOption?.value;
          if (!selectedOption) continue;
          const parentElement = this.elementList.find(
            (element: any) => element.id === fileMapping.idElement
          );
          if (!parentElement) continue;          
          const option = parentElement.documentsOfElement.find(
            (opt: any) => opt.idStandardElementsRequiredFiles === selectedOption.idStandardElementsRequiredFiles
          );
          if (option) {
            if (!option.multipleFiles) {
              option.savedFilesMetaData = [fileMapping.metadata];
              option.filesSaved = [fileMapping.metadata];
            } else {
              option.savedFilesMetaData = option.savedFilesMetaData || [];
              option.savedFilesMetaData.push(fileMapping.metadata);
              option.filesSaved = option.filesSaved || [];
              option.filesSaved.push(fileMapping.metadata);
            }
          }
        }
      }
      this.dialogEvent.emit(result);
    });
  }

  data(event: any) {
    this.zipFiles = event.zipData;
    this.unzipFiles = event.unzipData;
    this.unzipFilesSigns = event.unzipSigns;
    this.response = event.response;
    if (this.isSharedZipFile) {
      this.openSharedZipDialog();
    } else {
      this.openDialog();
    }
  }
}
