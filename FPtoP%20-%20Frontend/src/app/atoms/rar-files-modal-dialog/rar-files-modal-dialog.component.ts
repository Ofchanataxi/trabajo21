import {
  Component,
  Inject,
  OnInit,
  ViewEncapsulation
} from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from "@angular/material/dialog";
import { MatSelectChange } from "@angular/material/select";
import { FileUpload } from 'src/app/atoms/button-upload/button-upload.component';

interface DataRarDialog {
  item: any;
  itemIndex: number;
  unzipFiles: File[];
  zipFiles: File[];
  unzipFilesSigns: any[];
  signInfo?: any;
  options?: any;
 }
@Component({
  selector: "app-rar-files-modal-dialog",
  templateUrl: "./rar-files-modal-dialog.component.html",
  styleUrls: ["./rar-files-modal-dialog.component.scss"],
  encapsulation: ViewEncapsulation.None,
})

export class RarFilesModalDialogComponent implements OnInit{
  //REACTIVE FORMS
  fileTypeControl = new FormControl('');
  fileControl = new FormControl('');
  form: FormGroup;

  singleUseAssignments: { [optionId: number]: number | null } = {};
  fileSelections: { [fileIndex: number]: any | null } = {};
  allOptions: any[] = [];
  dialogData : DataRarDialog;
  constructor(
    public dialogRef: MatDialogRef<RarFilesModalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.dialogData = {
      item: data.item,
      itemIndex: data.itemIndex,
      unzipFiles: data.unzipFiles,
      zipFiles: data.zipFiles,
      unzipFilesSigns: data.unzipFilesSigns,
      signInfo: data.response,
      options: data.item.documentsOfElement.filter((option: { multipleFiles: boolean; savedFilesMetaData: any[]; }) => !(option.multipleFiles === false && option.savedFilesMetaData.length > 0)),
    }

    this.allOptions = [...this.dialogData.options];

    this.allOptions.forEach(option => {
      if (!option.multipleFiles) {
        this.singleUseAssignments[option.idStandardElementsRequiredFiles] = null;
      }
    });
  }

  ngOnInit(): void {
    const validUnzipFiles = this.dialogData.unzipFiles
      .map((file: File, index: number) => ({
        file,
        signs: this.dialogData.unzipFilesSigns[index],
        originalIndex: index,
      }))
      .filter(({ signs }) => signs !== undefined)
      .map(({ file, originalIndex }, idx) => {
        this.fileSelections[idx] = null;
        return this.createFileGroup(file, originalIndex);
      });

    this.form = this.fb.group({
      files: this.fb.array(validUnzipFiles),
    });
  }

  createFileGroup(file:any, originalIndex: number): FormGroup {
    return this.fb.group({
      name: file.name,
      metadata: file,
      idElement: this.dialogData.item.id,
      selectedOption: new FormControl(''),
      originalIndex: originalIndex,
    });
  }

  getAvailableOptionsForFile(fileIndex: number): any[] {
    const currentSelection = this.fileSelections[fileIndex];

    return this.allOptions.filter(option => {
      if (option.multipleFiles) return true;

      const assignedTo = this.singleUseAssignments[option.idStandardElementsRequiredFiles];

      return (
        assignedTo === null ||
        assignedTo === fileIndex ||
        (currentSelection && currentSelection.idStandardElementsRequiredFiles === option.idStandardElementsRequiredFiles)
      );
    });
  }

  compareSelectedOptions = (option: any, selected: any) => {
    if (!option || !selected) return false;
    return option.idStandardElementsRequiredFiles === selected.value.idStandardElementsRequiredFiles;
  }

  get filesFormArray(): FormArray {
    return this.form.get('files') as FormArray;
  }

  async selectedValue(index: number, event: MatSelectChange) {
    try{
      const selectedData = {
        value: event.value,
        text: event.source.triggerValue,
      };

      const previousOption = this.fileSelections[index];
      // liberar la opcion que solo admite un archivo
      if (previousOption && !previousOption.value.multipleFiles) {
        this.singleUseAssignments[previousOption.value.idStandardElementsRequiredFiles] = null;
      }

      // asignar la nueva opcion si no admite multiples archivos
      if (!selectedData.value.multipleFiles) {
        this.singleUseAssignments[selectedData.value.idStandardElementsRequiredFiles] = index;
      }

      // guardar la seleccion del archivo
      this.fileSelections[index] = selectedData;

      await this.filesFormArray.at(index).patchValue({
        selectedOption: selectedData,
      });
    } catch (error: any) {
      console.log(error);
    }
  }

  createInitialFile(file: File): FileUpload[] {
    if (!file) {
      return [];
    }
    return [{
      file: file,
      stateUpload: { progress: 100, completed: true },
      idStoredFiles: null,
      pathToFile: null,
    }];
  }

  formatFilePathAndName(fullPath: string): { path: string, fileName: string } {
    const lastSlashIndex = fullPath.lastIndexOf('/');
    let path = '';
    let fileName = fullPath;

    if (lastSlashIndex !== -1) {
      path = fullPath.substring(0, lastSlashIndex);
      fileName = fullPath.substring(lastSlashIndex + 1);
    }

    return { path, fileName };
  }

  closeDialogFromInside(): void {
    this.dialogRef.close(false);
  }

  sendFilesInformation() {
    this.data = this.form.value['files'];
    this.dialogRef.close(this.data);
  }

  checkInvalidSigns(index: number) {
    let invalidSigns: boolean = this.dialogData.signInfo[index].areThereProblems;
    return invalidSigns;
  }
}
