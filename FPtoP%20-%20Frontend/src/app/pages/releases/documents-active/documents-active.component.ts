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
  selector: 'app-documents-active',
  templateUrl: './documents-active.component.html',
  styleUrls: ['./documents-active.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class AppDocumentsActiveComponent implements OnInit {
  selectedItem: any;
  isFoldersOpen = true;
  errorMessage: string;
  isIndividualFilesOpen = true;
  documents: any;
  newSavedFilesMetaData: any = [];
  arrayReleases: any = [];
  supportFolder: any = [];
  releaseFolder: any = [];
  dhFiles: FileItem[] = [];
  public user: UserInfo;
  private userSerivce = inject(UserService);

  completeFolder: DocumentsElement = {
    name: 'Complete',
    folders: [] as FolderItem[],
    files: [] as FileItem[],
  };

  sendFolderD: FolderItem = {
    name: 'Enviados',
    subFolders: [] as FolderItem[],
    files: [] as FileItem[],
  };

  dhFolder: FolderItem = {
    name: 'DH Legalizado',
    subFolders: [] as FolderItem[],
    files: [] as FileItem[],
  };

  documentsElement: DocumentsElement = {
    name: 'Documentos',
    folders: [] as FolderItem[],
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
    this.userSerivce.currentUser.subscribe(currentUser => {
      this.user = currentUser;
    });
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
;
          this.AwaitDocumenteRelease(filteredDocuments);
        },
      });
  }



  // Método para obtener los documentos de un release
  AwaitDocumenteRelease(documents: any) {
    this.arrayReleases = [];
    let pendingRequests = documents.length;

    for (let i = 0; i < pendingRequests; i++) {
      this.releaseService
        .getDocumentsOfRelease(
          environment.apiBaseUrl +
            environment.endpoints.releaseManagement.getDocumentsOfRelease.url,
          environment.endpoints.releaseManagement.getDocumentsOfRelease.name,
          documents[i].ReleaseID
        )
        .subscribe({
          next: (response: any) => {
            if (response.data && response.data.length > 0) {
              const idReleaseState = documents[i].idReleaseState;

              // 🔹 Verifica si el usuario pertenece a IWC (id 5) o QAQC (id 7)
              const userCanSeeAll =
                this.user.idBusinessLine === 5 || this.user.idBusinessLine === 7;

              // 🔹 Filtra los archivos según la lógica de acceso
              const filteredFiles = response.data.filter(
                (file: any) =>
                  userCanSeeAll || file.idStandardBusinessLines === this.user.idBusinessLine
              );

              if (filteredFiles.length > 0) {
                this.arrayReleases.push({
                  ReleaseID: documents[i].ReleaseID,
                  files: filteredFiles.map((file: any) => ({
                    fileStoreID: file.StoredFileID,
                    fileName: file.fileName,
                    fileExtension: file.fileExtension,
                    size: file.FileSize || 0,
                    createdTimestamp: file.createdTimestamp,
                    filePath: file.filePath,
                    idStorageProvider: file.idStorageProvider,
                    pecDescription: file.pecDescription,
                    idElementRelease: file.idElementRelease,
                    idReleaseState: idReleaseState,
                  })),
                });
              }
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
    const uniqueFolders = new Map<string, FolderItem>();
    const validDocuments = this.documents.filter((doc: any) =>
      this.arrayReleases.some((release: any) => release.ReleaseID === doc.ReleaseID)
    );

    if (this.arrayReleases.length === 0) {
      this.errorMessage = 'No hay documentos';
    }

    validDocuments.forEach((doc: any) => {
      if (doc.name) {
        if (!uniqueFolders.has(doc.name)) {
          uniqueFolders.set(doc.name, { name: doc.name, files: [], subFolders: [] });
        }

        const mainFolder = uniqueFolders.get(doc.name)!;
        let releaseFolderName: any;
        if (mainFolder.name === 'Logistica') {
          releaseFolderName = `Despacho ${doc.ReleaseID}`;
        } else {
          releaseFolderName = `Liberación ${doc.ReleaseID}`;
        }
        this.releaseFolder = mainFolder.subFolders.find(sub => sub.name === releaseFolderName);

        if (!this.releaseFolder) {
          this.releaseFolder = { name: releaseFolderName, files: [], subFolders: [] };
          mainFolder.subFolders.push(this.releaseFolder);
        }

        const releaseData = this.arrayReleases.find(
          (release: any) => release.ReleaseID === doc.ReleaseID
        );

        if (releaseData) {
          this.supportFolder = this.releaseFolder.subFolders.find(
            (sub: any) => sub.name === 'Archivos Soporte'
          );
          if (!this.supportFolder) {
            this.supportFolder = { name: 'Archivos Soporte', files: [], subFolders: [] };
            this.releaseFolder.subFolders.push(this.supportFolder);
          }

          releaseData.files.forEach((file: any) => {
            if (file.idElementRelease) {
              this.supportFolder.files.push(file);
            } else {
              this.releaseFolder.files.push(file);
            }
          });
        }
      }
    });

    this.documentsElement = {
      name: 'Retorno',
      folders: Array.from(uniqueFolders.values()),
      files: [],
    };

    this.dhFiles = this.arrayReleases.flatMap((release: any) => release.files);

    this.dhFolder = {
      name: 'DH Legalizado',
      files: [],
      subFolders: Array.from(uniqueFolders.values()),
    };

    this.sendFolderD = {
      name: 'Enviados',
      files: [],
      subFolders: [
        {
          name: 'DH Legalizado',
          files: [],
          subFolders: this.documentsElement.folders,
        },
        {
          name: 'Todos',
          files: this.dhFiles,
          subFolders: [],
        },
      ],
    };

    this.completeFolder = {
      name: 'Complete',
      folders: [
        {
          name: 'Retorno',
          files: [],
          subFolders: this.documentsElement.folders,
        },
        this.sendFolderD,
        {
          name: 'Retenidos en pozo',
          files: [],
          subFolders: this.documentsElement.folders,
        },
      ],
      files: [],
    };
  }
}

