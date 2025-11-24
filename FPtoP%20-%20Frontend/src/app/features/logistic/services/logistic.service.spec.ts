import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LogisticService } from './logistic.service';
import { environment } from 'src/environments/environment';

describe('LogisticService', () => {
  let service: LogisticService;
  let httpTestingController: HttpTestingController;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LogisticService],
    });
    service = TestBed.inject(LogisticService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });


  afterEach(() => {
    httpTestingController.verify();
  });


  test('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('should send a new element item to the backend', () => {
    const newItem = { name: 'Test Item', quantity: 10 };
  });


  test('should send element data via POST request', () => {
    const testData = {
      "elementSelected": {
          "idElement": 2,
          "descriptionWithOutNameElement": [
              "3-1/2\"",
              "9.2",
              "ppf",
              "l-80",
              "cr1",
              "grade",
              "tsh",
              "blue",
              "thd",
              "r-2"
          ],
          "description": "TUBING 3-1/2\", 9.2 PPF., L-80 CR1 GRADE, TSH BLUE THD., R-2",
          "condition": "INSP- REPARADA",
          "quantity": 198,
          "serial": "12443",
          "heat": "38432",
          "oitInspection": "089-SHY-2022-20F2586",
          "oitReparation": "'250-2022",
          "observation": "BISELADO",
          "attributeParts": [
              {
                  "idAttribute": 12,
                  "nameAttribute": "Diámetro",
                  "idOptionAttribute": 23,
                  "nameOption": "3-1/2\"",
                  "elementToSearch": "3-1/2\""
              },
              {
                  "idAttribute": null,
                  "nameAttribute": null,
                  "idOptionAttribute": null,
                  "nameOption": "",
                  "elementToSearch": "9.2"
              },
              {
                  "idAttribute": null,
                  "nameAttribute": null,
                  "idOptionAttribute": null,
                  "nameOption": "",
                  "elementToSearch": "ppf"
              },
              {
                  "idAttribute": 16,
                  "nameAttribute": "Grado",
                  "idOptionAttribute": 53,
                  "nameOption": "l-80",
                  "elementToSearch": "l-80"
              },
              {
                  "idAttribute": null,
                  "nameAttribute": null,
                  "idOptionAttribute": null,
                  "nameOption": "",
                  "elementToSearch": "cr1"
              },
              {
                  "idAttribute": null,
                  "nameAttribute": null,
                  "idOptionAttribute": null,
                  "nameOption": "",
                  "elementToSearch": "grade"
              },
              {
                  "idAttribute": 15,
                  "nameAttribute": "Conexiones",
                  "idOptionAttribute": 31,
                  "nameOption": "tsh blue",
                  "elementToSearch": "tsh blue"
              },
              {
                  "idAttribute": null,
                  "nameAttribute": null,
                  "idOptionAttribute": null,
                  "nameOption": "",
                  "elementToSearch": "thd"
              },
              {
                  "idAttribute": null,
                  "nameAttribute": null,
                  "idOptionAttribute": null,
                  "nameOption": "",
                  "elementToSearch": "r-2"
              }
          ]
      },
      "newData": {
          "viewText": "TUBING 3-1/2\", 9.3 PPF., N-80Q GRADE, EU THD., R-2",
          "value": 2,
          "Nombre del bien": "Tubing",
          "Condición": "Nuevo",
          "Diámetro": "3-1/2\"",
          "Nivel de especificación": "PSL1",
          "Conexiones": "EU",
          "Grado": "TN80",
          "Peso": "12.75PPF"
      }
  };
    const mockResponse = { success: true };

    service.postNewElement(testData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    const req = httpTestingController.expectOne(environment.apiBaseUrl + environment.endpoints.logistic.uploadNewElement.url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(testData);

    req.flush(mockResponse); // Simula la respuesta del servidor
  });



});
