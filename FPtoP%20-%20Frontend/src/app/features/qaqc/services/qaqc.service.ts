import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

interface ChangeRequestRelease {
  releaseID: any;
  isApproved: boolean;
  commentary: string;
}

@Injectable()

/**
 * @param data Ingreso de una JSON con datos como { releaseID!: string, isApproved: false, commentary!: string
 */
export class QaqcService {
  private data: ChangeRequestRelease;
  constructor(private http: HttpClient) {}

  /**
   *  Metodo para envio de una solicitud POST a la db, para cambiar el estado de State Release a rechazado.
   * @param releaseID Identificador del release
   * @param commentary justificación del usuario debido al rechazo del State Release
   * @returns solicitud http cambiando el estado a rechezado
   */
  postRejectChangeStateRelease(releaseID: any, commentary: string) {
    const apiUrl = environment.endpoints.qaqc.releaseStateHistory.url;
    this.data = {
      releaseID,
      isApproved: false,
      commentary,
    };
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Url-Name": environment.endpoints.qaqc.releaseStateHistory.name,
    });
    return this.http.post<any>(apiUrl, JSON.stringify(this.data), { headers });
  }

  getRejectedOilFieldOperations() {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.qaqc.rejectedRelases.url;
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Url-Name": environment.endpoints.qaqc.rejectedRelases.name,
    });
    return this.http.get<any>(apiUrl, { headers });
  }

  getApprovedOilFieldOperations() {
    const apiUrl =
      environment.apiBaseUrl + environment.endpoints.qaqc.approvedRelases.url;
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Url-Name": environment.endpoints.qaqc.approvedRelases.name,
    });
    return this.http.get<any>(apiUrl, { headers });
  }

  /**
   * Metodo para envio de una solicitud POST a la db, para cambiar el estado de State Release a aprobado.
   * @param releaseID Identificador del release
   * @returns solicitud http cambiando el estado a aprobado
   */
  postApprovedChangeStateRelease(releaseID: any) {
    const apiUrl = environment.endpoints.qaqc.releaseStateHistory.url;
    this.data = {
      releaseID,
      isApproved: true,
      commentary: "",
    };
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Url-Name": environment.endpoints.qaqc.releaseStateHistory.name,
    });
    return this.http.post<any>(apiUrl, JSON.stringify(this.data), { headers });
  }
}
