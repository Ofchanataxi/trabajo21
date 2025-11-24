import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, map } from 'rxjs/operators';

export interface InterfaceRigTimeDetails {
  cliente: string;
  liderInstalacion: string;
  representanteCliente: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  detalle: string;
  fechaHoraArriboLocacion: string;
  fechaHoraInicioTrabajo: string;
  fechaHoraFinTrabajo: string;
  duration?: string;
  id?:number;
}

@Injectable({
  providedIn: 'root',
})
export class RunBesService {
  constructor(private http: HttpClient) {}

  getDataOperationDetails(idOilFieldOperation: number | null): Observable<any[]> {
    const apiUrl = environment.serverUrl + environment.endpoints.getDataOperationDetails.url;
    idOilFieldOperation = idOilFieldOperation == null ? 0 : idOilFieldOperation;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation);
    return this.http.get<any[]>(apiUrl, { params });
  }

  getInfoMechanicalDetails(idOilFieldOperation: number | null): Observable<Array<any[]>> {
    const apiUrlMechDet = environment.serverUrl + environment.endpoints.getMechanicalDetails.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    // Add parameters to request
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlMechDet, { params }).pipe(
      map(response => {
        console.log('Response Mechanical Details', response);
        return response;
      }),
      catchError(error => {
        console.error('Error getting mechanical details:', error);
        return of([]);
      })
    );
  }

  getInfoUndergroundEquipDetails(idOilFieldOperation: number | null): Observable<any[]> {
    const apiUrl = environment.serverUrl + environment.endpoints.getUndergroundEquipmentDetails.url;
    console.log(apiUrl);
    idOilFieldOperation = idOilFieldOperation == null ? 0 : idOilFieldOperation;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation);

    return this.http.get<any[]>(apiUrl, { params });
  }

  getDiametersCamisaCirculacion(): Observable<Array<any[]>> {
    const apiUrlDiamCamCirc =
      environment.serverUrl + environment.endpoints.getDiameterCamisaCirculacion.url;
    return this.http.get<any[]>(apiUrlDiamCamCirc, {}).pipe(
      map(response => {
        console.log('Response apiUrlDiamCamCirc', response);
        return response;
      }),
      catchError(error => {
        console.error('Error getting apiUrlDiamCamCirc:', error);
        return of([]);
      })
    );
  }

  getDiametersFlowCoupling(): Observable<Array<any[]>> {
    const apiUrlDiamFlowCoupling =
      environment.serverUrl + environment.endpoints.getDiameterFlowCoupling.url;
    return this.http.get<any[]>(apiUrlDiamFlowCoupling, {}).pipe(
      map(response => {
        console.log('Response apiUrlDiamFlowCoupling', response);
        return response;
      }),
      catchError(error => {
        console.error('Error getting apiUrlDiamFlowCoupling:', error);
        return of([]);
      })
    );
  }

  getDiametersNoGo(): Observable<Array<any[]>> {
    const apiUrlDiamNoGo = environment.serverUrl + environment.endpoints.getDiameterNoGo.url;
    return this.http.get<any[]>(apiUrlDiamNoGo, {}).pipe(
      map(response => {
        console.log('Response apiUrlDiamNoGo', response);
        return response;
      }),
      catchError(error => {
        console.error('Error getting apiUrlDiamNoGo:', error);
        return of([]);
      })
    );
  }

  getYToolDetails(idOilFieldOperation: number | null): Observable<any[]> {
    const apiUrl = environment.serverUrl + environment.endpoints.getYToolDetails.url;
    idOilFieldOperation = idOilFieldOperation == null ? 0 : idOilFieldOperation;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation);

    return this.http.get<any[]>(apiUrl, { params });
  }

  getInfoCableProtectors(idOilFieldOperation: number | null): Observable<Array<any[]>> {
    const apiUrlCableProtectors =
      environment.serverUrl + environment.endpoints.getInfoCableProtectors.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlCableProtectors, { params }).pipe(
      map(response => {
        console.log('Response Protectores de Cable', response);
        return response;
      }),
      catchError(error => {
        console.error('Error Protectores de Cable:', error);
        return of([]);
      })
    );
  }

  getInfoProtectolizers(idOilFieldOperation: number | null): Observable<Array<any[]>> {
    const apiUrlProtetolizers =
      environment.serverUrl + environment.endpoints.getInfoProtectolizers.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlProtetolizers, { params }).pipe(
      map(response => {
        console.log('Response getInfoProtectolizers', response);
        return response;
      }),
      catchError(error => {
        console.error('Error getInfoProtectolizers:', error);
        return of([]);
      })
    );
  }

  getInfoBandas(idOilFieldOperation: number | null): Observable<Array<any[]>> {
    const apiUrlBandas = environment.serverUrl + environment.endpoints.getInfoBandas.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlBandas, { params }).pipe(
      map(response => {
        console.log('Response getInfoBandas', response);
        return response;
      }),
      catchError(error => {
        console.error('Error getInfoBandas:', error);
        return of([]);
      })
    );
  }

  getInfoLowProfile(idOilFieldOperation: number | null): Observable<Array<any[]>> {
    const apiUrlLowProfile = environment.serverUrl + environment.endpoints.getInfoLowProfile.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlLowProfile, { params }).pipe(
      map(response => {
        console.log('Response getInfoLowProfile', response);
        return response;
      }),
      catchError(error => {
        console.error('Error getInfoLowProfile:', error);
        return of([]);
      })
    );
  }

  getDownholeHeaders(): Observable<Array<any[]>> {
    const apiUrlDownholeHeaders =
      environment.serverUrl + environment.endpoints.getDownholeHeaders.url;
    return this.http.get<any[]>(apiUrlDownholeHeaders, {}).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error getting apiUrlDownholeHeaders:', error);
        return of([]);
      })
    );
  }

  getInformationDownhole(idOilFieldOperation: number | null): Observable<Array<any[]>> {
    const apiUrlInformationDownhole =
      environment.serverUrl + environment.endpoints.getInformationDownhole.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlInformationDownhole, { params }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error getting apiUrlDownholeHeaders:', error);
        return of([]);
      })
    );
  }

  getInformationDownholeCabezaDescarga(
    idOilFieldOperation: number | null
  ): Observable<Array<any[]>> {
    const apiUrlInformationDownholeCabezaDescarga =
      environment.serverUrl + environment.endpoints.getInformationDownholeCabezaDescarga.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlInformationDownholeCabezaDescarga, { params }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error getting apiUrlInformationDownholeBomb:', error);
        return of([]);
      })
    );
  }

  getInformationDownholeBomb(idOilFieldOperation: number | null): Observable<Array<any[]>> {
    const apiUrlInformationDownholeBomb =
      environment.serverUrl + environment.endpoints.getInformationDownholeBomb.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlInformationDownholeBomb, { params }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error getting apiUrlInformationDownholeBomb:', error);
        return of([]);
      })
    );
  }

  getInformationDownholeIntkSepGas(idOilFieldOperation: number | null): Observable<Array<any[]>> {
    const apiUrlInformationDownholeIntkSepGas =
      environment.serverUrl + environment.endpoints.getInformationDownholeIntkSepGas.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlInformationDownholeIntkSepGas, { params }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error getting apiUrlInformationDownholeIntkSepGas:', error);
        return of([]);
      })
    );
  }

  getInformationDownholeProtectors(idOilFieldOperation: number | null): Observable<Array<any[]>> {
    const apiUrlInformationDownholeProtectors =
      environment.serverUrl + environment.endpoints.getInformationDownholeProtectors.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlInformationDownholeProtectors, { params }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error getting getInformationDownholeProtectors:', error);
        return of([]);
      })
    );
  }

  getInformationDownholeMotors(idOilFieldOperation: number | null): Observable<Array<any[]>> {
    const apiUrlInformationDownholeMotors =
      environment.serverUrl + environment.endpoints.getInformationDownholeMotors.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlInformationDownholeMotors, { params }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error getting apiUrlInformationDownholeMotors:', error);
        return of([]);
      })
    );
  }

  getInformationDownholeSensors(idOilFieldOperation: number | null): Observable<Array<any[]>> {
    const apiUrlInformationDownholeSensors =
      environment.serverUrl + environment.endpoints.getInformationDownholeSensors.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlInformationDownholeSensors, { params }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error getting apiUrlInformationDownholeSensors:', error);
        return of([]);
      })
    );
  }

  getInformationDownholeTransferline(idOilFieldOperation: number | null): Observable<Array<any[]>> {
    const apiUrlInformationDownholeTransferline =
      environment.serverUrl + environment.endpoints.getInformationDownholeTransferline.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlInformationDownholeTransferline, { params }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error getting apiUrlInformationDownholeTransferline:', error);
        return of([]);
      })
    );
  }

  getInformationDownholeCable(idOilFieldOperation: number | null): Observable<Array<any[]>> {
    const apiUrlInformationDownholeCable =
      environment.serverUrl + environment.endpoints.getInformationDownholeCable.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlInformationDownholeCable, { params }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error getting apiUrlInformationDownholeCable:', error);
        return of([]);
      })
    );
  }

  getInformationDownholePenetrador(idOilFieldOperation: number | null): Observable<Array<any[]>> {
    const apiUrlInformationDownholePenetrador =
      environment.serverUrl + environment.endpoints.getInformationDownholePenetrador.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlInformationDownholePenetrador, { params }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error getting apiUrlInformationDownholePenetrador:', error);
        return of([]);
      })
    );
  }

  getAnyReleaseALSvalidation(idOilFieldOperation: number | null): Observable<Array<any[]>> {
    const apiUrlAnyReleaseALSvalidation =
      environment.serverUrl + environment.endpoints.getAnyReleaseALSvalidation.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlAnyReleaseALSvalidation, { params }).pipe(
      map(response => {
        console.log(response);
        return response;
      }),
      catchError(error => {
        console.error('Error getting AnyReleaseALSvalidation:', error);
        return of([]);
      })
    );
  }

  getInformationRunBes(idOilFieldOperation: number | null): Observable<Array<any[]>> {
    const apiUrlInformationRunBes = environment.serverUrl + environment.endpoints.getRunBesData.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlInformationRunBes, { params }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error getting getRunBesData:', error);
        return of([]);
      })
    );
  }

  getInformationRigTime(idOilFieldOperation: number | null): Observable<Array<any[]>> {
    const apiUrlInformationRigTime =
      environment.serverUrl + environment.endpoints.getRigTimeData.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlInformationRigTime, { params }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error getting apiUrlInformationRigTime:', error);
        return of([]);
      })
    );
  }

  createRunBesData(
    dataRunBes: any,
    detailsRigTime: InterfaceRigTimeDetails[],
    mechDetails: any
  ): Observable<any> {
    const apiUrl = environment.serverUrl + environment.endpoints.createRunBesData.url;
    const bodyData = {
      id: dataRunBes.id,
      idOilfieldOperations: dataRunBes.idOilfieldOperations,
      preparadopor: dataRunBes.preparadopor,
      aprobadopor: dataRunBes.aprobadopor,
      liderinstalacion: dataRunBes.liderinstalacion,
      companyman: dataRunBes.companyman,
      iniciodeinstalacion: dataRunBes.iniciodeinstalacion,
      operador: dataRunBes.operador,
      pais: dataRunBes.pais,
      findeinstalacion: dataRunBes.findeinstalacion,
      liderarranque: dataRunBes.liderarranque,
      cliente: dataRunBes.cliente,
      arranque: dataRunBes.arranque,
      testigos: dataRunBes.testigos,
      tipodeaplicacion: dataRunBes.tipodeaplicacion,
      topebodhmd: dataRunBes.topebodhmd,
      topebodhtvd: dataRunBes.topebodhtvd,
      topeintakemd: dataRunBes.topeintakemd,
      topeintaketvd: dataRunBes.topeintaketvd,
      topemotormd: dataRunBes.topemotormd,
      topemotortvd: dataRunBes.topemotortvd,
      topeperforadosmd: dataRunBes.topeperforadosmd,
      topeperforadostvd: dataRunBes.topeperforadostvd,
      baseperforadosmd: dataRunBes.baseperforadosmd,
      baseperforadostvd: dataRunBes.baseperforadostvd,
      totalwelldepthmd: dataRunBes.totalwelldepthmd,
      totalwelldepthtvd: dataRunBes.totalwelldepthtvd,
      maxdls: dataRunBes.maxdls,
      profundidad: dataRunBes.profundidad,
      dlsprofbomba: dataRunBes.dlsprofbomba,
      desviacionprofbomba: dataRunBes.desviacionprofbomba,
      desviacionmaximaporatravesar: dataRunBes.desviacionmaximaporatravesar,
      longitudequipoesp: dataRunBes.longitudequipoesp,
      longitudcable: dataRunBes.longitudcable,
      longitudcablemle: dataRunBes.longitudcablemle,
      longitudcapilarexterno: dataRunBes.longitudcapilarexterno,
      camisacirculacion: dataRunBes.camisaCirculValue,
      camisacirculaciondiametro: dataRunBes.camisaCirculDiameter,
      flowcoupling: dataRunBes.flowCouplingValue,
      flowcouplingdiametro: dataRunBes.flowCouplingDiameter,
      slidingsleevenogo: dataRunBes.noGoValue,
      slidingsleevenogodiametro: dataRunBes.noGoDiameter,
      ytoolmarca: dataRunBes.ytoolmarca,
      ytooltipo: dataRunBes.ytooltipo,
      ytoolpn: dataRunBes.ytoolpn,
      ytoolblankingplugpn: dataRunBes.ytoolblankingplugpn,
      ytoolbypasstubingod: dataRunBes.ytoolbypasstubingod,
      ytoolunidadesbypasstubing: dataRunBes.ytoolunidadesbypasstubing,
      ytoolroscabypasstubing: dataRunBes.ytoolroscabypasstubing,
      ytoolbypassclamps: dataRunBes.ytoolbypassclamps,
      protectolizers: dataRunBes.protectolizers,
      bandas: dataRunBes.bandas,
      lowprofile: dataRunBes.lowprofile,
      completaciondual: dataRunBes.completaciondual,
      podhanger: dataRunBes.podhanger,
      podpenetrator: dataRunBes.podpenetrator,
      podcasingsize: dataRunBes.podcasingsize,
      packerutilizado: dataRunBes.packerutilizado,
      motorshroud: dataRunBes.motorshroud,
      localizacionempaltesobreladescarga: dataRunBes.localizacionempaltesobreladescarga,
      puntodeinyeccionderecho: dataRunBes.puntodeinyeccionderecho,
      puntodeinyeccionizquierdo: dataRunBes.puntodeinyeccionizquierdo,
      gensettablerodistmodelo: dataRunBes.gensettablerodistmodelo,
      gensettablerodistnoserie: dataRunBes.gensettablerodistnoserie,
      gensettablerodistparte: dataRunBes.gensettablerodistparte,
      gensettablerodistkvarating: dataRunBes.gensettablerodistkvarating,
      gensettablerodistprivolts: dataRunBes.gensettablerodistprivolts,
      gensettablerodistpropiedad: dataRunBes.gensettablerodistpropiedad,
      sdtshiftmodelo: dataRunBes.sdtshiftmodelo,
      sdtshiftnoserie: dataRunBes.sdtshiftnoserie,
      sdtshiftnoparte: dataRunBes.sdtshiftnoparte,
      sdtshiftkvarating: dataRunBes.sdtshiftkvarating,
      sdtshiftprivolts: dataRunBes.sdtshiftprivolts,
      sdtshiftpropiedad: dataRunBes.sdtshiftpropiedad,
      vsddescripcion: dataRunBes.vsddescripcion,
      vsdnoseri: dataRunBes.vsdnoseri,
      vsdnoparte: dataRunBes.vsdnoparte,
      vsdkvarating: dataRunBes.vsdkvarating,
      vsdpulsos: dataRunBes.vsdpulsos,
      vsdpropiedad: dataRunBes.vsdpropiedad,
      sutmodelo: dataRunBes.sutmodelo,
      sutnoserie: dataRunBes.sutnoserie,
      sutnoparte: dataRunBes.sutnoparte,
      sutkvarating: dataRunBes.sutkvarating,
      sutsecvolts: dataRunBes.sutsecvolts,
      sutpropiedad: dataRunBes.sutpropiedad,
      pruebamegadainicialpi: dataRunBes.pruebamegadainicialpi,
      pruebamegadainicialpd: dataRunBes.pruebamegadainicialpd,
      pruebamegadainicialti: dataRunBes.pruebamegadainicialti,
      pruebamegadainicialtm: dataRunBes.pruebamegadainicialtm,
      pruebamegadainicialff: dataRunBes.pruebamegadainicialff,
      pruebamegadainicialft: dataRunBes.pruebamegadainicialft,
      pruebamegadainicialamp: dataRunBes.pruebamegadainicialamp,
      pruebamegadainicialhz: dataRunBes.pruebamegadainicialhz,
      pruebamegadaintermediapi: dataRunBes.pruebamegadaintermediapi,
      pruebamegadaintermediapd: dataRunBes.pruebamegadaintermediapd,
      pruebamegadaintermediati: dataRunBes.pruebamegadaintermediati,
      pruebamegadaintermediatm: dataRunBes.pruebamegadaintermediatm,
      pruebamegadaintermediaff: dataRunBes.pruebamegadaintermediaff,
      pruebamegadaintermediaft: dataRunBes.pruebamegadaintermediaft,
      pruebamegadaintermediaamp: dataRunBes.pruebamegadaintermediaamp,
      pruebamegadaintermediahz: dataRunBes.pruebamegadaintermediahz,
      pruebamegadafinalpi: dataRunBes.pruebamegadafinalpi,
      pruebamegadafinalpd: dataRunBes.pruebamegadafinalpd,
      pruebamegadafinalti: dataRunBes.pruebamegadafinalti,
      pruebamegadafinaltm: dataRunBes.pruebamegadafinaltm,
      pruebamegadafinalff: dataRunBes.pruebamegadafinalff,
      pruebamegadafinalft: dataRunBes.pruebamegadafinalft,
      pruebamegadafinalamp: dataRunBes.pruebamegadafinalamp,
      pruebamegadafinalhz: dataRunBes.pruebamegadafinalhz,
      pruebaarranquecontroladorpi: dataRunBes.pruebaarranquecontroladorpi,
      pruebaarranquecontroladorpd: dataRunBes.pruebaarranquecontroladorpd,
      pruebaarranquecontroladorti: dataRunBes.pruebaarranquecontroladorti,
      pruebaarranquecontroladortm: dataRunBes.pruebaarranquecontroladortm,
      pruebaarranquecontroladorff: dataRunBes.pruebaarranquecontroladorff,
      pruebaarranquecontroladorft: dataRunBes.pruebaarranquecontroladorft,
      pruebaarranquecontroladoramp: dataRunBes.pruebaarranquecontroladoramp,
      pruebaarranquecontroladorhz: dataRunBes.pruebaarranquecontroladorhz,
      pruebaarranquerotacion1pi: dataRunBes.pruebaarranquerotacion1pi,
      pruebaarranquerotacion1pd: dataRunBes.pruebaarranquerotacion1pd,
      pruebaarranquerotacion1ti: dataRunBes.pruebaarranquerotacion1ti,
      pruebaarranquerotacion1tm: dataRunBes.pruebaarranquerotacion1tm,
      pruebaarranquerotacion1ff: dataRunBes.pruebaarranquerotacion1ff,
      pruebaarranquerotacion1ft: dataRunBes.pruebaarranquerotacion1ft,
      pruebaarranquerotacion1amp: dataRunBes.pruebaarranquerotacion1amp,
      pruebaarranquerotacion1hz: dataRunBes.pruebaarranquerotacion1hz,
      pruebaarranquerotacioncpi: dataRunBes.pruebaarranquerotacioncpi,
      pruebaarranquerotacioncpd: dataRunBes.pruebaarranquerotacioncpd,
      pruebaarranquerotacioncti: dataRunBes.pruebaarranquerotacioncti,
      pruebaarranquerotacionctm: dataRunBes.pruebaarranquerotacionctm,
      pruebaarranquerotacioncff: dataRunBes.pruebaarranquerotacioncff,
      pruebaarranquerotacioncft: dataRunBes.pruebaarranquerotacioncft,
      pruebaarranquerotacioncamp: dataRunBes.pruebaarranquerotacioncamp,
      pruebaarranquerotacionchz: dataRunBes.pruebaarranquerotacionchz,
      pruebaarranqueproduccionpi: dataRunBes.pruebaarranqueproduccionpi,
      pruebaarranqueproduccionpd: dataRunBes.pruebaarranqueproduccionpd,
      pruebaarranqueproduccionti: dataRunBes.pruebaarranqueproduccionti,
      pruebaarranqueproducciontm: dataRunBes.pruebaarranqueproducciontm,
      pruebaarranqueproduccionff: dataRunBes.pruebaarranqueproduccionff,
      pruebaarranqueproduccionft: dataRunBes.pruebaarranqueproduccionft,
      pruebaarranqueproduccionamp: dataRunBes.pruebaarranqueproduccionamp,
      pruebaarranqueproduccionhz: dataRunBes.pruebaarranqueproduccionhz,
      tmotorhi: dataRunBes.tmotorhi,
      tintakehi: dataRunBes.tintakehi,
      pdhi: dataRunBes.pdhi,
      frecmax: dataRunBes.frecmax,
      frecmin: dataRunBes.frecmin,
      frecbase: dataRunBes.frecbase,
      ol: dataRunBes.ol,
      ul: dataRunBes.ul,
      tapvoltaje: dataRunBes.tapvoltaje,
      observaciones: dataRunBes.observaciones,
      initialproductionzone: dataRunBes.initialproductionzone,
      //Rig time details
      detailsrigtime: detailsRigTime,
      //Mech details
      mechanicaldetails: mechDetails,
    };
    return this.http.post<any[]>(apiUrl, bodyData);
  }

  getSignatureFlow(
    idUser: number | null,
    idOilFieldOperation: number | null
  ): Observable<{
    flujo: any[];
    permisos: {
      puedeCrear: boolean;
      puedeFirmar: boolean;
      puedeEditar: boolean;
    };
    reporte: any;
    plantillaNotificacion: number;
    idPasoActivo: number;
  }> {
    const apigetSignatureFlow = environment.serverUrl + environment.endpoints.getSignFlow.url;
    const bodyData = { idUser: idUser, idOilFieldOperation: idOilFieldOperation ?? 0 };

    return this.http
      .post<{
        flujo: any[];
        permisos: {
          puedeCrear: boolean;
          puedeFirmar: boolean;
          puedeEditar: boolean;
        };
        reporte: any;
        plantillaNotificacion: number;
        idPasoActivo: number;
      }>(apigetSignatureFlow, bodyData)
      .pipe(
        catchError(error => {
          console.error('Error en getSignatureFlow:', error);
          return of({
            flujo: [],
            permisos: {
              puedeCrear: false,
              puedeFirmar: false,
              puedeEditar: false,
            },
            reporte: null,
            plantillaNotificacion: 0,
            idPasoActivo: 0,
          });
        })
      );
  }

  signReportStep(userId: number, firmaId: number): Observable<void> {
    const apiupdateSignFlow = environment.serverUrl + environment.endpoints.updateSignFlow.url;
    return this.http.post<void>(apiupdateSignFlow, {
      userId,
      firmaId,
    });
  }

  getLastRunBesState(idOilFieldOperation: number | null): Observable<Array<any[]>> {
    const apiUrlInformationRigTime =
      environment.serverUrl + environment.endpoints.getLastRunBesState.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlInformationRigTime, { params }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error getting apiUrlInformationRigTime:', error);
        return of([]);
      })
    );
  }

  createRunBesStateHistory(
    idOilfieldOperations: number,
    fecha_notificacion: string,
    idUser: number,
    idPreviousState: number,
    idNewState: number,
    idFile: number
  ): Observable<any[]> {
    const apiUrl = environment.serverUrl + environment.endpoints.createRunBesStateHistory.url;
    const bodyData = {
      idOilfieldOperations,
      fecha_notificacion,
      idUser,
      idPreviousState,
      idNewState,
      idFile,
    };
    //console.log('createRunBesStateHistory', bodyData);
    return this.http.post<any[]>(apiUrl, bodyData);
  }

  getFileOilFieldOperation(idOilFieldOperation: number | null): Observable<any[]> {
    const apiUrlgetFileRunBesOperation =
      environment.serverUrl + environment.endpoints.getFileRunBesOperation.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlgetFileRunBesOperation, { params }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error getting getFileRunBesOperation:', error);
        return of([]);
      })
    );
  }

  getStandardElementGroups(): Observable<Array<any[]>> {
    const apiUrlDiamNoGo =
      environment.serverUrl + environment.endpoints.getStandardElementsGroups.url;
    return this.http.get<any[]>(apiUrlDiamNoGo, {}).pipe(
      map(response => {
        console.log('Response getStandardElementsGroups', response);
        return response;
      }),
      catchError(error => {
        console.error('Error getting getStandardElementsGroups:', error);
        return of([]);
      })
    );
  }

  insertRunBesElementDetail(payload: {
    idRunBes: number;
    attributes: Array<{
      idStandardElement: number;
      column: string;
      value: string;
      groupRowId: string;
    }>;
  }): Observable<any> {
    const apiUrl = environment.serverUrl + environment.endpoints.insertRunBesElementDetail.url;
    return this.http.post<any[]>(apiUrl, payload);
  }

  getRunBesElementDetailTemporals(idOilFieldOperation: number | null): Observable<any[]> {
    const apiUrlgetRunBesElementDetailTemporals =
      environment.serverUrl + environment.endpoints.getRunBesElementDetail.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlgetRunBesElementDetailTemporals, { params }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error getting apiUrlgetRunBesElementDetailTemporals:', error);
        return of([]);
      })
    );
  }

  generateXslRunBes(idOilFieldOperation: number | null): Observable<any[]> {
    idOilFieldOperation = idOilFieldOperation === null ? 0 : idOilFieldOperation;
    const apiUrl = environment.serverUrl + environment.endpoints.downloadRunBesXslRepot.url;
    const bodyData = {
      idOilFieldOperation,
    };
    console.log('func generateXslRunBes', bodyData);
    return this.http.post<any[]>(apiUrl, bodyData);
  }

  getFileRunBesReport(idOilFieldOperation: number | null): Observable<any[]> {
    const apiUrlgetFileRunBesOperation =
      environment.serverUrl + environment.endpoints.getFileRunBesReport.url;
    idOilFieldOperation = idOilFieldOperation ?? 0;
    const params = new HttpParams().set('idOilFieldOperation', idOilFieldOperation.toString());
    return this.http.get<any[]>(apiUrlgetFileRunBesOperation, { params }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error getting getFileRunBesOperation:', error);
        return of([]);
      })
    );
  }
}


