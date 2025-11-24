import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ReleaseService } from 'src/app/services/release.service';
import { FilesDocumentsActiveComponent } from 'src/app/shared/components/templates/files-of-documents-active/files-of-documents-active.component';
import { environment } from 'src/environments/environment';
import { UserInfo, UserService } from 'src/app/features/auth/services/user.service';

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

@Component({
  selector: 'app-return-files',
  templateUrl: './return-file.component.html',
  styleUrls: ['../documents-active/documents-active.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class AppReturnFilesComponent implements OnInit {
  public user: UserInfo;
  public documents: any;
  public isFoldersOpen = true;
  public isIndividualFilesOpen = true;
  public returnFolder: FolderItem = { name: 'Retorno', subFolders: [], files: [] };
  private selectedItem: any;
  private retornoFiles: FileItem[] = [];

  constructor(
    private releaseService: ReleaseService,
    private router: Router,
    private dialog: MatDialog,
  ) {
    this.initializeSelectedItem();
  }

  ngOnInit(): void {
    if (this.selectedItem) this.loadReleases();
  }

  private initializeSelectedItem(): void {
    const navigation = this.router.getCurrentNavigation();
    this.selectedItem =
      navigation?.extras.state?.['selectedItem'] ??
      JSON.parse(sessionStorage.getItem('selectedItem') || 'null');

    if (this.selectedItem) {
      sessionStorage.setItem('selectedItem', JSON.stringify(this.selectedItem));
    }
  }

  private loadReleases(): void {
    const params = { idOilfieldOperations: this.selectedItem.idOilfieldOperations };
    this.releaseService
      .getReleases(
        environment.apiBaseUrl + environment.endpoints.releaseManagement.getReleases.url,
        environment.endpoints.releaseManagement.getReleases.name,
        params
      )
      .subscribe({
        next: ({ data }) => {
          const filtered = (data || []).filter((doc: any) => doc.idReleaseState === 4);
          this.fetchReturnDocuments(filtered);
        },
        error: err => console.error('Error cargando releases:', err),
      });
  }

  private fetchReturnDocuments(documents: any[]): void {
    let pending = documents.length;

    documents.forEach(doc => {
      this.releaseService
        .getDocumentsOfReleaseToReturn(
          environment.apiBaseUrl +
            environment.endpoints.releaseManagement.getDocumentsOfReleaseToReturn.url,
          environment.endpoints.releaseManagement.getDocumentsOfRelease.name,
          doc.ReleaseID
        )
        .subscribe({
          next: ({ data }) => {
            if (Array.isArray(data)) this.retornoFiles.push(...data);
          },
          error: err => console.error('Error obteniendo documentos:', err),
          complete: () => {
            if (--pending === 0) this.structureReturnFolder();
          },
        });
    });
  }

  private structureReturnFolder(): void {
    this.returnFolder = {
      name: 'Retorno',
      files: [],
      subFolders: [
        {
          name: 'Todos los retornados',
          files: this.retornoFiles,
          subFolders: [],
        },
      ],
    };
  }

  public toggleOpenFile(folder: FolderItem): void {
    const dialogRef = this.dialog.open(FilesDocumentsActiveComponent, {
      width: '100%',
      height: '100%',
      maxWidth: 'none',
      data: folder,
      panelClass: 'custom-modalbox',
    });

    dialogRef.componentInstance.dialogClosed.subscribe((closed: boolean) => {
      if (closed) dialogRef.close();
    });
  }

  public toggleFolders(): void {
    this.isFoldersOpen = !this.isFoldersOpen;
  }

  public toggleIndividualFiles(): void {
    this.isIndividualFilesOpen = !this.isIndividualFilesOpen;
  }

  public countDirectDocumentsAndFolders(folder: FolderItem): {
    filesCount: number;
    foldersCount: number;
  } {
    return {
      filesCount: folder.files.length,
      foldersCount: folder.subFolders.length,
    };
  }

  public hasFilesInFirstSubFolderReturn(): boolean {
    return !!this.returnFolder.subFolders[0]?.files?.length;
  }
}