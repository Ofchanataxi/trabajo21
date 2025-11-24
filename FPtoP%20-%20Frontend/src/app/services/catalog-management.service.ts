import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpRequest,
} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, map } from 'rxjs';
import { Synonym } from '../organisms/element-handling/interfaces/interfaces.interfaces';


export interface UpdateExtensionDocumentPayload {
  // Esta interfaz puede ser usada también para agregar si los campos son similares
  id?: number; // Opcional para nuevos documentos
  name: string;
  fileExtension: string;
  multipleFiles: boolean;
  useDocumentoHabilitante: boolean;
  useDossier: boolean;
  idStandardElements: number;
  idStandardCondition: number;
  required: boolean;
  required_signatures: boolean;
  total_people_required_to_sign: number;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogManagementService {
  constructor(private http: HttpClient) {}

  getStandardBusinessLines(): Observable<any> {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.CatalogManagement.getStandardBusinessLine.url;
    const urlName = environment.endpoints.CatalogManagement.getStandardBusinessLine.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    return this.http.get<any>(apiUrl);
  }
  getStandardElements(standardElementName: string, idBusinessLine: number | null): Observable<any> {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.CatalogManagement.getStandardElements.url;
    const urlName = environment.endpoints.CatalogManagement.getStandardElements.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    const params = {
      standardElementName,
      idBusinessLine,
    };

    return this.http.post<any>(apiUrl, params, { headers, withCredentials: true });
  }
  getStandardWellSections(): Observable<any> {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.CatalogManagement.getStandardWellSections.url;
    const urlName = environment.endpoints.CatalogManagement.getStandardWellSections.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    return this.http.get<any>(apiUrl);
  }

  getStandardWellInfrastructureType(): Observable<any> {
    const apiUrl =
      environment.apiBaseUrl +
      environment.endpoints.CatalogManagement.getStandardWellInfrastructureType.url;
    const urlName = environment.endpoints.CatalogManagement.getStandardWellInfrastructureType.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    return this.http.get<any>(apiUrl);
  }
  addStandardElement(obj: Object): Observable<any> {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.CatalogManagement.addStandardElement.url;
    const urlName = environment.endpoints.CatalogManagement.addStandardElement.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    return this.http.post<any>(apiUrl, obj, { headers });
  }
  getStandardAttributeTypes(): Observable<any> {
    const apiUrl =
      environment.apiBaseUrl +
      environment.endpoints.CatalogManagement.getStandardAttributeTypes.url;
    const urlName = environment.endpoints.CatalogManagement.getStandardAttributeTypes.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    return this.http.get<any>(apiUrl);
  }

  editStandardAttributes(obj: Object): Observable<any> {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.CatalogManagement.editStandardAttributes.url;
    const urlName = environment.endpoints.CatalogManagement.editStandardAttributes.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    return this.http.post<any>(apiUrl, obj, { headers });
  }

  deleteAttributeOption(idStandardAttributeOption: number, idUser: number | null): Observable<any> {
    const apiUrl = `${environment.apiBaseUrl}${environment.endpoints.CatalogManagement.deleteAttributeOption.url}/${idStandardAttributeOption}/${idUser}`;
    const urlName = environment.endpoints.CatalogManagement.deleteAttributeOption.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    return this.http.delete<any>(apiUrl, { headers });
  }

  updateAttributeOption(idStandardAttribute: number, option: Object): Observable<any> {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.CatalogManagement.updateAttributeOption.url;
    const urlName = environment.endpoints.CatalogManagement.updateAttributeOption.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });
    const params = {
      idStandardAttribute,
      option,
    };

    return this.http.post<any>(apiUrl, params, { headers });
  }

  deleteAttribute(
    idStandardElement: number | null,
    idStandardAttribute: number,
    attributeOrderInDescription: number,
    idUser: number | null
  ): Observable<any> {
    const apiUrl = `${environment.apiBaseUrl}${environment.endpoints.CatalogManagement.deleteAttribute.url}/${idStandardElement}/${idStandardAttribute}/${attributeOrderInDescription}/${idUser}`;
    const urlName = environment.endpoints.CatalogManagement.deleteAttribute.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    return this.http.delete<any>(apiUrl, { headers });
  }

  updateAttribute(idStandardElement: number, attribute: Object): Observable<any> {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.CatalogManagement.updateAttribute.url;
    const urlName = environment.endpoints.CatalogManagement.updateAttribute.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });
    const params = {
      idStandardElement,
      attribute,
    };

    return this.http.post<any>(apiUrl, params, { headers });
  }

  deleteElement(idStandardElement: number | null, idUser: number | null): Observable<any> {
    const endpointConfig = environment.endpoints.CatalogManagement.deleteStandardElement;

    const apiUrl = `${environment.apiBaseUrl}${endpointConfig.url}/${idStandardElement}/${idUser}`;
    const urlName = endpointConfig.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    return this.http.delete<any>(apiUrl, { headers });
  }

  addStandarElementsSynonyms(obj: Object): Observable<any> {
    const apiUrl =
      environment.apiBaseUrl +
      environment.endpoints.CatalogManagement.addStandardElementsSynonyms.url;
    const urlName = environment.endpoints.CatalogManagement.addStandardElementsSynonyms.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    return this.http.post<any>(apiUrl, obj, { headers });
  }

  getStandardElementsById(elementId: { id: number }): Observable<any> {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.CatalogManagement.getStandardElementsById.url;
    const urlName = environment.endpoints.CatalogManagement.getStandardElementsById.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    return this.http.post<any>(apiUrl, elementId, { headers });
  }

  updateStandardElement(obj: Object): Observable<any> {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.CatalogManagement.updateStandardElement.url;
    const urlName = environment.endpoints.CatalogManagement.updateStandardElement.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    return this.http.post<any>(apiUrl, obj, { headers });
  }

  updateExtensionDocuments(obj: Object): Observable<any> {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.CatalogManagement.updateExtensionDocuments.url;
    const urlName = environment.endpoints.CatalogManagement.updateExtensionDocuments.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    return this.http.post<any>(apiUrl, obj, { headers });
  }

  deleteExtensionDocuments(obj: Object): Observable<any> {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.CatalogManagement.deleteExtensionDocuments.url;
    const urlName = environment.endpoints.CatalogManagement.deleteExtensionDocuments.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    return this.http.post<any>(apiUrl, obj, { headers });
  }

  editStandarElementsSynonyms(id: number, synonymText: string): Observable<any> {
    const apiUrl =
      environment.apiBaseUrl +
      environment.endpoints.CatalogManagement.editStandarElementsSynonyms.url;
    const urlName = environment.endpoints.CatalogManagement.editStandarElementsSynonyms.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    return this.http.put<any>(`${apiUrl}/${id}`, { synonym: synonymText }, { headers });
  }

  deleteStandardElementSynonym(id: number, idUser: number | null): Observable<any> {
    const apiUrl =
      environment.apiBaseUrl +
      environment.endpoints.CatalogManagement.deleteStandarElementsSynonyms.url;
    const urlName = environment.endpoints.CatalogManagement.deleteStandarElementsSynonyms.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    return this.http.delete<any>(`${apiUrl}/${id}/${idUser}`, { headers });
  }

  public getSynonymsForElement(elementId: number): Observable<Synonym[]> {
    const apiUrlBase =
      environment.apiBaseUrl + environment.endpoints.CatalogManagement.getSynonymsForElement.url;
    const urlName = environment.endpoints.CatalogManagement.getSynonymsForElement.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    const finalUrl = `${apiUrlBase}/${elementId}/synonyms`;

   return this.http.get<{ success: boolean; data: Synonym[] }>(finalUrl, { headers }).pipe(
     map(response => response.data || []) 
   );
  }

  addOrUpdateStandardElementImage(id: number, imageBase64: string): Observable<any> {
    const apiUrl = environment.apiBaseUrl + environment.endpoints.CatalogManagement.addOrUpdateStandardElementImage.url;
    const urlName = environment.endpoints.CatalogManagement.addOrUpdateStandardElementImage.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });
    return this.http.post<any>(`${apiUrl}/${id}`, { imageBase64 }, { headers });
  }

  deleteStandardElementImage(id: number): Observable<any> {
    const apiUrl = environment.apiBaseUrl + environment.endpoints.CatalogManagement.deleteStandardElementImage.url;
    const urlName = environment.endpoints.CatalogManagement.deleteStandardElementImage.name;
    const headers = new HttpHeaders({ 'Url-Name': urlName });

    return this.http.delete<any>(`${apiUrl}/${id}`, { headers });
  }
}
