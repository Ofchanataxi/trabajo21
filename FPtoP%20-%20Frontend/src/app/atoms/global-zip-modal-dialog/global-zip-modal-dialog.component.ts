import { Component, Inject, OnInit, } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { FileUpload } from '../button-upload/button-upload.component';

export interface FileUIWrapper {
  file: File;
  isExpanded: boolean;
  originalIndex: number;
}

@Component({
  selector: 'app-global-zip-modal-dialog',
  templateUrl: './global-zip-modal-dialog.component.html',
  styleUrls: ['./global-zip-modal-dialog.component.scss'],
})
export class GlobalZipModalDialogComponent implements OnInit {
  public form: FormGroup;
  public filesToDisplay: FileUIWrapper[] = [];
  public elementList: any[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<GlobalZipModalDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      unzipFiles: File[];
      unzipFilesSigns: any[];
      zipFiles: File[];
      elementList: any[];
      serialsMap: Map<string, any[]>;
      inspectionOitsMap: Map<string, any[]>;
      repairOitsMap: Map<string, any[]>;
    }
  ) {
    this.elementList = this.data.elementList.map(element => {
      const filteredDocuments = element.documentsOfElement.filter(
        (option: { multipleFiles: boolean; savedFilesMetaData: any[] }) =>
          !(
            option.multipleFiles === false &&
            option.savedFilesMetaData &&
            option.savedFilesMetaData.length > 0
          )
      );
      return {
        ...element,
        documentsOfElement: filteredDocuments,
      };
    });
  }

  ngOnInit(): void {
    const validFiles = this.data.unzipFiles
      .map((file, index) => ({
        file,
        signs: this.data.unzipFilesSigns[index],
        originalIndex: index,
      }))
      .filter(({ signs }) => signs !== undefined);
    this.filesToDisplay = validFiles.map(({ file, originalIndex }) => ({
      file,
      isExpanded: false,
      originalIndex,
    }));

    this.form = this.fb.group({
      files: this.fb.array(
        validFiles.map(({ file, originalIndex }) => this.createFileGroup(file, originalIndex))
      ),
    });
    this._runAutoMapping();
  }

  private createFileGroup(file: File, originalIndex: number): FormGroup {
    return this.fb.group({
      fileInfo: [file],
      originalIndex: [originalIndex],
      mappings: this.fb.array([]),
    });
  }

  get filesFormArray(): FormArray {
    return this.form.get('files') as FormArray;
  }

  getMappingsFormArray(fileIndex: number): FormArray {
    return this.filesFormArray.at(fileIndex).get('mappings') as FormArray;
  }

  public toggleMapping(index: number): void {
    this.filesToDisplay.forEach((file, i) => {
      file.isExpanded = i === index ? !file.isExpanded : false;
    });
  }

  public getSelectedOption(fileIndex: number, elementId: number): any | null {
    const mappingsArray = this.getMappingsFormArray(fileIndex);
    const foundMapping = mappingsArray.controls.find(
      control => control.value.idElementRelease === elementId
    );
    return foundMapping ? foundMapping.value.value : null;
  }

  public onResetSelections(fileIndex: number): void {
    this.getMappingsFormArray(fileIndex).clear();
    this.filesToDisplay[fileIndex].isExpanded = false;
  }

  public continueToNext(fileIndex: number): void {
    this.filesToDisplay[fileIndex].isExpanded = false;
    if (fileIndex + 1 < this.filesToDisplay.length) {
      this.toggleMapping(fileIndex + 1);
    }
  }

  public selectedValue(fileIndex: number, elementId: number, event: MatSelectChange): void {
    const mappingsArray = this.getMappingsFormArray(fileIndex);
    const selectedDoc = event.value;

    const existingMappingIndex = mappingsArray.controls.findIndex(
      control => control.value.idElementRelease === elementId
    );
    if (!selectedDoc) {
      if (existingMappingIndex > -1) {
        mappingsArray.removeAt(existingMappingIndex);
      }
      return;
    }
    const newMappingGroup = this.fb.group({
      idElementRelease: elementId,
      value: selectedDoc,
    });

    if (existingMappingIndex > -1) {
      mappingsArray.at(existingMappingIndex).setValue(newMappingGroup.value);
    } else {
      mappingsArray.push(newMappingGroup);
    }
  }

  public getAvailableOptionsForItem(element: any, currentFileIndex: number): any[] {
    return element.documentsOfElement.filter((docOption: any) => {
      if (docOption.multipleFiles) {
        return true;
      }
      const isTakenByAnotherFile = this.filesFormArray.controls.some((fileControl, fileIndex) => {
        if (fileIndex === currentFileIndex) {
          return false;
        }

        const mappings = (fileControl.get('mappings') as FormArray).controls;
        return mappings.some(
          mapping =>
            mapping.value.idElementRelease === element.id &&
            mapping.value.value.idStandardElementsRequiredFiles ===
              docOption.idStandardElementsRequiredFiles
        );
      });
      return !isTakenByAnotherFile;
    });
  }

  public sendFilesInformation() {
    const filesFormValue = this.form.value.files;
    const transformedData = filesFormValue.flatMap(
      (file: { mappings: any[]; fileInfo: { name: any }; originalIndex: any }) => {
        if (!file.mappings || file.mappings.length === 0) {
          return [];
        }
        return file.mappings.map((mapping: { idElementRelease: any; value: { name: any } }) => {
          return {
            idElement: mapping.idElementRelease,
            metadata: file.fileInfo,
            name: file.fileInfo.name,
            originalIndex: file.originalIndex,
            selectedOption: {
              text: mapping.value.name,
              value: mapping.value,
            },
          };
        });
      }
    );
    this.dialogRef.close(transformedData);
  }

  formatFilePathAndName(fullPath: string): { path: string; fileName: string } {
    const lastSlashIndex = fullPath.lastIndexOf('/');
    let path = '';
    let fileName = fullPath;

    if (lastSlashIndex !== -1) {
      path = fullPath.substring(0, lastSlashIndex);
      fileName = fullPath.substring(lastSlashIndex + 1);
    }

    return { path, fileName };
  }
  public autoMapMessages = new Map<number, {
    type: 'success' | 'warning',
    message: string,
    matches?: { element: any, doc: any }[]
  }>();
  
  private _normalizeString(text: string): string {
    if (!text) return '';
    const commonWords = ['copia', 'documento', 'doc', 'pdf'];
    let normalized = text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const regexWords = new RegExp(`\\b(${commonWords.join('|')})\\b`, 'g');
    normalized = normalized.replace(regexWords, '');

    return normalized
      .replace(/[_\s\.\(\)]+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/-+/g, '-');
  }

  private _runAutoMapping(): void {
    const mappedDocSlots = new Set<string>();
    this.elementList.forEach(element => {
      element.documentsOfElement.forEach((doc: any) => {
        if (!doc.multipleFiles && doc.savedFilesMetaData?.length > 0) {
          mappedDocSlots.add(`${element.id}-${doc.idStandardElementsRequiredFiles}`);
        }
      });
    });

    this.filesFormArray.controls.forEach((fileControl, fileIndex) => {
      const fullPath = (fileControl.value.fileInfo as File).name;
      let fileNameOnly = this.formatFilePathAndName(fullPath).fileName;
      fileNameOnly = fileNameOnly.replace(/_/g, '-');
      const normalizedFileName = this._normalizeString(fileNameOnly);

      let matchesForFile: { element: any, doc: any }[] = [];
      let matchInfo = { key: '', type: '' };
      let warningInfo: { docName: string, key: string, type: string } | null = null;

      const dictionaries = [
        { map: this.data.serialsMap, type: 'serial' },
        { map: this.data.inspectionOitsMap, type: 'OIT de Inspección' },
        { map: this.data.repairOitsMap, type: 'OIT de Reparación' },
      ];

      for (const { map, type } of dictionaries) {
        if (!map) continue;
        for (const [key, elements] of map.entries()) {
          if (!key) continue;
          const searchPattern = new RegExp(`\\b${key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');

          if (searchPattern.test(fileNameOnly)) {
            for (const element of elements) {
              const fullElementData = this.elementList.find(e => e.id === element.id);
              if (!fullElementData) continue;
              
              const availableDocumentsOfElement = fullElementData.documentsOfElement;
              if (availableDocumentsOfElement.length === 0) continue;

              const docMatch = availableDocumentsOfElement.find((doc: { name: string; }) => this._normalizeString(doc.name) && normalizedFileName.includes(this._normalizeString(doc.name)));
              const bestMatch = docMatch || (availableDocumentsOfElement.length === 1 && normalizedFileName.replace(this._normalizeString(key), '').replace(/-/g, '').length < 3 ? availableDocumentsOfElement[0] : null);

              if (bestMatch) {
                const compositeKey = `${fullElementData.id}-${bestMatch.idStandardElementsRequiredFiles}`;
                const isAlreadyMapped = !bestMatch.multipleFiles && mappedDocSlots.has(compositeKey);

                if (!isAlreadyMapped) {
                  matchesForFile.push({ element, doc: bestMatch });
                  if (!bestMatch.multipleFiles) {
                    mappedDocSlots.add(compositeKey);
                  }
                } else if (!warningInfo) {
                  warningInfo = { docName: bestMatch.name, key, type };
                }
              }
            }
            if (matchesForFile.length > 0) {
              matchInfo = { key, type };
              break;
            }
          }
        }
        if (matchesForFile.length > 0 || warningInfo) break;
      }

      if (matchesForFile.length > 0) {
        const mappingsArray = this.getMappingsFormArray(fileIndex);
        matchesForFile.forEach(({ element, doc }) => {
          mappingsArray.push(this.fb.group({ idElementRelease: element.id, value: doc }));
        });

        const uniqueDocNames = [...new Set(matchesForFile.map(m => `"${m.doc.name}"`))];
        const message = `El archivo se ha asignado automáticamente al documento de soporte ${uniqueDocNames.join(', ')} de los elementos con ${matchInfo.type} ${matchInfo.key}.`;
        this.autoMapMessages.set(fileIndex, { type: 'success', message, matches: matchesForFile });
      } else if (warningInfo) {
        const message = `Archivo no asignado automáticamente, debido a que ya se ha mapeado antes un archivo para "${warningInfo.docName}" con ${warningInfo.type} ${warningInfo.key}.`;
        this.autoMapMessages.set(fileIndex, { type: 'warning', message });
      }
    });
  }

  createInitialFile(file: File): FileUpload[] {
    if (!file) {
      return [];
    }
    return [
      {
        file: file,
        stateUpload: { progress: 100, completed: true },
        idStoredFiles: null,
        pathToFile: null,
      },
    ];
  }

  closeDialogFromInside(): void {
    this.dialogRef.close(false);
  }

  public saveAndClose(): void {
    this.dialogRef.close(this.form.value);
  }
}
