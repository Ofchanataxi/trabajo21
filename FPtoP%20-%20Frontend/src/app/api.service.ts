import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { SharedDataService } from "./shared/services/shared-data.service";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private sharedData: SharedDataService
  ) {}

  getData(apiUrl: string, urlName: string, params?: any): Observable<any> {
    const headers = new HttpHeaders({ "Url-Name": urlName });
    return this.http.get<any>(apiUrl, {
      headers,
      params,
      withCredentials: true,
    });
  }

  // Método para hacer la llamada al backend con los parámetros específicos
  getRequieredExtensionDocuments(
    apiUrl: string,
    urlName: string,
    params: { idStandardElement: number }
  ): Observable<any> {
    const headers = new HttpHeaders({ "Url-Name": urlName });
    return this.http.get<any>(apiUrl, {
      headers,
      params,
    });
  }

  // Método para enviar datos (POST)
  postData(apiUrl: string, data: any, urlName: string): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Url-Name": urlName,
    });
    return this.http.post<any>(apiUrl, data, { headers });
  }

  getAttrElementRules(apiUrl: string, urlName: string): Observable<any> {
    let selectedAttributesKeys: [] = [];
    let selectedTrueAttributesOptions: { [key: string]: any[] } = {};
    let selectedFalseAttributesOptions: { [key: string]: any[] } = {};
    let foundRules = { foundRules: [] };
    const headers = new HttpHeaders({ "Url-Name": urlName });

    const subject = new Subject<any>();

    this.http
      .get<any>(apiUrl, { headers })
      .subscribe((response: { [x: string]: any }) => {
      let attributesResponse = response["StandardAttributes"];
      let attributesKeys = attributesResponse
        .slice()
        .sort((a: any, b: any) => a.orderInDescription - b.orderInDescription)
        .map((attribute: any) => attribute.name);

      let attributesOptions = attributesResponse.reduce(
        (
          acc: {
            showTrueData: {
              [key: string]: {
                viewText: string;
                value: string;
                elementId: number;
              }[];
            };
            allData: {
              [key: string]: {
                viewText: string;
                value: string;
                elementId: number;
              }[];
            };
          },
          attribute: {
            StandardAttributeOptions: { value: string; id: string }[];
            idStandardElement: number;
            name: string;
            alwaysShow: boolean;
            id: any;
          }
        ) => {
          if (attribute.alwaysShow) {
            if (!acc.showTrueData[attribute.name]) {
              acc.showTrueData[attribute.name] = [];
            }
            acc.showTrueData[attribute.name] = 
            attribute.StandardAttributeOptions.map(
              (element: { value: any; id: any }) => ({
                viewText: element.value,
                value: element.id,
                elementId: attribute.idStandardElement,
                attrId: attribute.id,
              })
            );
          } else {
            if (!acc.allData[attribute.name]) {
              acc.allData[attribute.name] = [];
            }
            acc.allData[attribute.name] = 
            attribute.StandardAttributeOptions.map(
              (element: { value: any; id: any }) => ({
                viewText: element.value,
                value: element.id,
                elementId: attribute.idStandardElement,
              })
            );
          }
          return acc;
        },
        { showTrueData: {}, allData: {} }
      );

      let attributeRules = attributesResponse.reduce(
        (
          acc: {
            foundRules: {
              restrictedByAttr: string;
              restrictedByOption: string;
              restrictedAttr: any;
              restrictedAttrName: any;
            }[];
          },
          attribute: {
            StandardAttributeOptions: { value: string; id: string }[];
            idStandardElement: number;
            name: string;
            alwaysShow: boolean;
            onlyShowWith_idStandardAttributes: string;
            onlyShowWith_idStandardAttributeOptions: string;
            id: string;
          }
        ) => {
          if (!attribute.alwaysShow) {
            let attId = attribute.onlyShowWith_idStandardAttributes;
            let attIdOptions = attribute.onlyShowWith_idStandardAttributeOptions;

            if (attId && attIdOptions) {
              let foundAtt = attributesResponse.find((element: any) => element.id === attId);

              if (foundAtt) {
                let foundOptions = foundAtt.StandardAttributeOptions.find(
                  (option: any) => option.id === attIdOptions
                );

                if (foundOptions) {
                  acc.foundRules.push({
                    restrictedAttr: attribute.id,
                    restrictedAttrName: attribute.name,
                    restrictedByAttr: foundAtt.id,
                    restrictedByOption: foundOptions.id,
                  });
                }
              }
            }
          }
          return acc;
        },
        { foundRules: [] }
      );

      selectedAttributesKeys = attributesKeys;
      selectedTrueAttributesOptions = attributesOptions.showTrueData;
      selectedFalseAttributesOptions = attributesOptions.allData;
      foundRules = attributeRules;

      subject.next({
        attributesResponse: attributesResponse,
        selectedAttributesKeys: selectedAttributesKeys,
        selectedTrueAttributesOptions: selectedTrueAttributesOptions,
        selectedFalseAttributesOptions: selectedFalseAttributesOptions,
        foundRules: foundRules,
      });

      subject.complete();
    });

    return subject.asObservable();
  }

  processWellDataDescription(apiUrl: string, data: any, urlName: string): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Url-Name": urlName,
    });

    return this.http.post<any>(apiUrl, data, { headers });
  }

  processWellData(apiUrl: string, data: any, urlName: string): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Url-Name": urlName,
    });
    const subject = new Subject<any>();
    this.http.post<any>(apiUrl, data, { headers }).subscribe({
      next: response => {
        console.log("Response from server:", response);
        console.log("Captura de informacion");
        this.sharedData.changeDataElementRelease(response);
        let errorElements = [];
        for (let i = 0; i < response.length; i++) {
          const element = response[i];

          if (element.idElement === null) {
            errorElements.push(element);
            continue;
          }

          for (let j = 0; j < element.attributeParts.length; j++) {
            const attributePart = element.attributeParts[j];
            if (attributePart.idAttribute === null) {
              errorElements.push(element);
              break;
            }
          }
        }
        if (errorElements.length > 0) {
          subject.next({ errorElements: errorElements, isError: false });
          subject.complete();
        } else {
          subject.next({ errorElements: errorElements, isError: true });
          subject.complete();
        }
      },
      error: error => {},
    });
    return subject.asObservable();
  }

  checkWellIdParam(apiUrl: string, wellId: string, urlName: string): Observable<string> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Url-Name": urlName,
    });
    const subject = new Subject<any>();
    let wellName: string;
    this.http.get<any>(apiUrl, { headers }).subscribe({
      next(response) {
        wellName = response.wellName;
      },
      complete() {
        subject.next({ wellName: wellName });
        subject.complete();
      },
    });
    return subject.asObservable();
  }

  postWellheadPacking(obj: Object) {
    const apiUrl = environment.apiBaseUrl + environment.endpoints.wellhead.postWellheadPacking.url;
    const urlName = environment.endpoints.wellhead.postWellheadPacking.name;
    const headers = new HttpHeaders().append("Content-Type", "application/json");
    console.log(obj);
    return this.http.post<any>(apiUrl, obj, { headers });
  }
}
