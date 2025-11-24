import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ReleaseService } from 'src/app/services/release.service';
import { FilesDocumentsActiveComponent } from 'src/app/shared/components/templates/files-of-documents-active/files-of-documents-active.component';
import { environment } from 'src/environments/environment';
import { UserInfo, UserService } from 'src/app/features/auth/services/user.service';

// Interfaces para tipado estricto
interface FileItem {
  fileName: string;
  fileExtension: string;
  size: number;
  createdTimestamp: string;
  filePath: string;
  idStorageProvider: number;
}

interface FolderItem {
  name: string;
  files: FileItem[];
  subFolders: FolderItem[];
}

interface DocumentsElement {
  name: string;
  folders: FolderItem[];
  files: FileItem[];
}
@Component({
  selector: 'app-detained-files',
  templateUrl: './detained-files.component.html',
  styleUrls: ['../documents-active/documents-active.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class AppDetainedFilesComponent implements OnInit {
  selectedItem: any;
  isFoldersOpen = true;
  isIndividualFilesOpen = true;
  documents: any;
  public user: UserInfo;

  detainedFolder: FolderItem = {
    name: 'Retenidos en pozo',
    subFolders: [] as FolderItem[],
    files: [] as FileItem[],
  };

  constructor(
    private releaseService: ReleaseService,
    private router: Router,
    public dialog: MatDialog,
    public cdr: ChangeDetectorRef
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.['selectedItem']) {
      this.selectedItem = navigation.extras.state['selectedItem'];
      sessionStorage.setItem('selectedItem', JSON.stringify(this.selectedItem));
    } else {
      const savedItem = sessionStorage.getItem('selectedItem');
      this.selectedItem = savedItem ? JSON.parse(savedItem) : null;
    }
  }

  ngOnInit(): void {
    if (!this.selectedItem) return;
    this.ReleaseService();
  }

  // Método para obtener los releases
  ReleaseService() {
    const params = { idOilfieldOperations: this.selectedItem.idOilfieldOperations };
    this.releaseService
      .getReleases(
        environment.apiBaseUrl + environment.endpoints.releaseManagement.getReleases.url,
        environment.endpoints.releaseManagement.getReleases.name,
        params
      )
      .subscribe({
        next: (response: any) => {
          this.documents = response.data || [];

          // Filtrar releases con idReleaseState === 4 antes de procesarlos
          const filteredDocuments = this.documents.filter((doc: any) => doc.idReleaseState === 4);

          this.getDocumentsToDetained(filteredDocuments);
        },
      });
  }

  retenidosFiles: FileItem[] = [];
  getDocumentsToDetained(documents: any) {
    let pendingRequests = documents.length;

    for (let i = 0; i < pendingRequests; i++) {
      this.releaseService
        .getDocumentsOfReleaseToReturn(
          environment.apiBaseUrl +
            environment.endpoints.releaseManagement.getDocumentsOfReleaseToDetained.url,
          environment.endpoints.releaseManagement.getDocumentsOfRelease.name,
          documents[i].ReleaseID
        )
        .subscribe({
          next: (response: any) => {
            if (response.data && response.data.length > 0) {
              this.retenidosFiles.push(...response.data);
            }
          },
          error: err => console.error('Error al obtener los datos:', err),
          complete: () => {
            pendingRequests--;
            if (pendingRequests === 0) {
              this.structureDocuments();
            }
          },
        });
    }
  }

  hasFilesInFirstSubFolderDetained(): boolean {
    return this.detainedFolder.subFolders[0]?.files?.length > 0;
  }

  // Método para abrir un archivo en POPUP
  toggleOpenFile(folder: any) {
    const dialogRef = this.dialog.open(FilesDocumentsActiveComponent, {
      width: '100%',
      height: '100%',
      maxWidth: 'none',
      data: folder,
      panelClass: 'custom-modalbox',
    });

    dialogRef.componentInstance.dialogClosed.subscribe((result: boolean) => {
      if (result) dialogRef.close();
    });
  }

  toggleFolders() {
    this.isFoldersOpen = !this.isFoldersOpen;
  }

  toggleIndividualFiles() {
    this.isIndividualFilesOpen = !this.isIndividualFilesOpen;
  }

  countDirectDocumentsAndFolders(folder: FolderItem): { filesCount: number; foldersCount: number } {
    return {
      filesCount: folder.files.length,
      foldersCount: folder.subFolders.length,
    };
  }

  //Estructura de los documentos en carpetas
  structureDocuments() {
    this.detainedFolder = {
      name: 'Retenidos en pozo',
      files: [],
      subFolders: [
        {
          name: 'Todos los retenidos ',
          files: this.retenidosFiles,
          subFolders: [],
        },
      ],
    };
  }
}


