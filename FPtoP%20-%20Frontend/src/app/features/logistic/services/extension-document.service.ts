import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { MessageService, SlbSeverity } from '@slb-dls/angular-material/notification';
import { ApiService } from 'src/app/api.service';
import { LogisticService } from 'src/app/features/logistic/services/logistic.service';
import { ReleaseService } from 'src/app/services/release.service';
import { environment } from 'src/environments/environment';
import {
  CatalogManagementService,
  UpdateExtensionDocumentPayload,
} from 'src/app/services/catalog-management.service';

import { DocumentDisplayItem } from '../../../shared/components/molecules/error-processing-new-extension-documents/extension-document-list/extension-document-list.component';
import { StandardCondition } from '../../../shared/components/molecules/error-processing-new-extension-documents/extension-document-form/extension-document-form.component';

import { ExtensionFormValue } from '../../../shared/components/molecules/error-processing-new-extension-documents/extension-document-form/extension-document-form.component';

@Injectable({
  providedIn: 'root',
})
export class ExtensionDocumentService {
  private readonly apiService = inject(ApiService);
  private readonly releaseService = inject(ReleaseService);
  private readonly catalogService = inject(CatalogManagementService);
  private readonly logisticService = inject(LogisticService);
  private readonly messageService = inject(MessageService);

  private readonly standardConditionsSubject = new BehaviorSubject<StandardCondition[]>([]);
  private readonly documentsSubject = new BehaviorSubject<DocumentDisplayItem[]>([]);
  private readonly selectedElementIdSubject = new BehaviorSubject<number | null>(null);

  public readonly standardConditions$ = this.standardConditionsSubject.asObservable();
  public readonly documents$ = this.documentsSubject.asObservable();

  constructor() {
    this.fetchDocumentsOnElementChange();
  }

  //service to obtain the extension badges, example: new, inspected
  public async loadStandardConditions(): Promise<any> {
    this.releaseService
      .getStandardCondition()
      .pipe(
        map(
          response => response?.data?.map((el: any) => ({ id: el.id, name: el.condition })) || []
        ),
        catchError(error => {
          this.handleError('Error al obtener las condiciones estándar.', error);
          return of([]);
        })
      )
      .subscribe(conditions => this.standardConditionsSubject.next(conditions));
  }

  //When the selected element changes, the subject is updated.
  public setSelectedElement(elementId: number | null): void {
    this.selectedElementIdSubject.next(elementId);
  }

  //fetch for existing extension documents in the selected item
  private fetchDocumentsOnElementChange(): void {
    this.selectedElementIdSubject
      .pipe(
        switchMap(elementId => {
          if (!elementId) {
            return of([]);
          }
          const params = { idStandardElement: elementId };
          return this.apiService.getRequieredExtensionDocuments(
            environment.apiBaseUrl + environment.endpoints.getRequieredExtensionDocuments.url,
            environment.endpoints.getRequieredExtensionDocuments.name,
            params
          );
        }),
        withLatestFrom(this.standardConditions$),
        map(([response, conditions]) =>
          this.mapApiResponseToDisplayItems(response.data || [], conditions)
        ),
        catchError(error => {
          this.handleError('No se pudieron cargar los documentos de extensión.', error);
          return of([]);
        })
      )
      .subscribe(documents => this.documentsSubject.next(documents));
  }

  public addDocument(formValue: ExtensionFormValue): Observable<any> {
    const payload = this.createPayload(formValue);
    const { id, ...newDocumentPayload } = payload;
    return this.logisticService
      .postNewErrorExtensionDocuments(newDocumentPayload as UpdateExtensionDocumentPayload)
      .pipe(
        tap(res => {
          this.showSuccessMessage(res?.message || 'Documento agregado correctamente.');
          this.refreshDocuments();
        }),
        catchError(error => this.handleAndThrowError('Error al guardar nuevo documento.', error))
      );
  }

  public updateDocument(formValue: ExtensionFormValue): Observable<any> {
    const payload = this.createPayload(formValue);
    if (!payload.id) return EMPTY;

    return this.catalogService.updateExtensionDocuments([payload]).pipe(
      tap(res => {
        this.showSuccessMessage(res?.message || 'Documento actualizado correctamente.');
        this.refreshDocuments();
      }),
      catchError(error => this.handleAndThrowError('Error al actualizar el documento.', error))
    );
  }

  public deleteDocument(documentId: number, idUser: number | null): Observable<any> {
    const payload = {
      documentsToDelete: [{ id: documentId }],
      idUser: idUser,
    };
    return this.catalogService.deleteExtensionDocuments(payload).pipe(
      tap(res => {
        this.showSuccessMessage(res?.message || 'Documento eliminado correctamente.');
        this.refreshDocuments();
      }),
      catchError(error => this.handleAndThrowError('Error al eliminar el documento.', error))
    );
  }

  //Transform data from the form to document format fo the backend(payload)
  private createPayload(formValue: ExtensionFormValue): UpdateExtensionDocumentPayload {
    return {
      id: formValue.id,
      name: formValue.name,
      fileExtension: `application/${formValue.fileExtension}`,
      multipleFiles: formValue.multipleFiles,
      useDocumentoHabilitante: formValue.useDocumentoHabilitante,
      useDossier: formValue.useDossier,
      idStandardElements: this.selectedElementIdSubject.getValue()!,
      idStandardCondition: formValue.idStandardCondition,
      required: formValue.required,
      required_signatures: formValue.requiredSignatures,
      total_people_required_to_sign: formValue.totalPeopleRequiredToSign,
    };
  }

  //transform data from the backend to the view format
  private mapApiResponseToDisplayItems(
    items: any[],
    conditions: StandardCondition[]
  ): DocumentDisplayItem[] {
    if (!items) return [];
    return items.map((item: any): DocumentDisplayItem => {
      const condition = conditions.find(cond => cond.id === item.idStandardCondition);
      return {
        id: item.idRequiredExtensionDocument || item.id,
        idStandardCondition: item.idStandardCondition,
        idStandardElements: this.selectedElementIdSubject.getValue()!,
        condition: condition ? condition.name : `ID ${item.idStandardCondition}`,
        name: item.name,
        fileExtension: item.fileExtension.includes('/')
          ? item.fileExtension.split('/').pop()!
          : item.fileExtension,
        originalMultipleFiles: item.multipleFiles,
        originalUseDocumentoHabilitante: item.useDocumentoHabilitante,
        originalUseDossier: item.useDossier,
        originalRequiredSignatures: item.required_signatures,
        originalTotalPeopleRequiredToSign: item.total_people_required_to_sign,
        originalRequired: item.required,
        displayMultipleFiles: item.multipleFiles ? 'Varios archivos' : '1',
        displayUseDocumentoHabilitante: item.useDocumentoHabilitante ? '✔' : '-',
        displayUseDossier: item.useDossier ? '✔' : '-',
        displayRequired: item.required ? '✔' : '-',
        displayRequiredSignatures: item.required_signatures ? '✔' : '-',
        displayTotalPeopleRequiredToSign: item.required_signatures
          ? `${item.total_people_required_to_sign}`
          : '-',
      };
    });
  }

  //refresh the documents list when the do crud actions
  private refreshDocuments(): void {
    this.setSelectedElement(this.selectedElementIdSubject.getValue());
  }

  private showSuccessMessage(detail: string): void {
    this.messageService.add({
      target: 'toast',
      severity: SlbSeverity.Success,
      summary: 'Éxito',
      detail,
    });
  }

  private handleError(summary: string, error: any): void {
    console.error(summary, error);
    this.messageService.add({
      severity: SlbSeverity.Error,
      summary: summary,
      detail: error?.error?.message || error?.message || 'Ocurrió un error desconocido.',
    });
  }

  private handleAndThrowError(summary: string, error: any): Observable<never> {
    this.handleError(summary, error);
    return EMPTY;
  }
}
