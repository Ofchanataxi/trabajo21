import { Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { firstValueFrom, Subscription } from 'rxjs';
import { ApiService } from 'src/app/api.service';
import { environment } from 'src/environments/environment';
import { MessageService, SlbSeverity } from '@slb-dls/angular-material/notification';
import { UserService } from 'src/app/features/auth/services/user.service';
import { CatalogManagementService } from 'src/app/services/catalog-management.service';
import { StandardElementGroup, groupElementsByName } from 'src/app/organisms/element-handling/utils/standard-element.utils';

@Component({
  selector: 'app-validate-description',
  templateUrl: './validate-description.component.html',
  styleUrls: ['./validate-description.component.scss'],
})
export class ValidateDescriptionComponent implements OnInit, OnDestroy {
  @Input() idBusinessLine: number | null = null;
  @Input() description: string = '';

  public errorList: any[] = [];
  public validatedElement: any | null = null;
  public hasErrors: boolean = false;
  public isLoading: boolean = false;
  public validationAttempted: boolean = false;

  public elementForDocs: { viewText: string; value: number } | null = null;

  public userId: number | null = null;
  public idBusinessLineUser: number | null = null;
  private userSubscription: Subscription | undefined;

  private apiService = inject(ApiService);
  private messageService = inject(MessageService);

  public matchedElementGroup: StandardElementGroup | null = null;

  public validationError: string | null = null;

  constructor(
    private catalogService: CatalogManagementService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.userService.currentUser.subscribe(userInfo => {
      if (userInfo) {
        this.idBusinessLineUser = userInfo.idBusinessLine;
        this.userId = userInfo.id;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async checkDescriptionAndFetchDetails(): Promise<void> {
    if (!this.idBusinessLine || !this.description?.trim()) {
      return;
    }

    this.isLoading = true;
    this.validationAttempted = true;
    this.validatedElement = null;
    this.matchedElementGroup = null;
    this.errorList = [];
    this.hasErrors = false;

    const dataToSend = {
      idBusinessLine: this.idBusinessLine,
      elements: [{ description: this.description.trim() }],
    };

    try {
      const response = await firstValueFrom(
        this.apiService.processWellDataDescription(
          environment.serverUrl + environment.endpoints.standardVerification.url,
          dataToSend,
          environment.endpoints.standardVerification.name
        )
      );

      const resultElement = response && response[0];
      if (!resultElement) {
        throw new Error('Respuesta del servidor inválida o vacía.');
      }

      this.errorList = [resultElement];

      this.hasErrors =
        resultElement.idElement === null ||
        resultElement.attributeParts.some((attr: any) => attr.idAttribute === null);

      if (resultElement.idElement && resultElement.elementName) {
        this.elementForDocs = {
          viewText: resultElement.elementName,
          value: resultElement.idElement,
        };
      }

      if (this.hasErrors) {
        if (resultElement.elementName) {
          this.fetchElementDetails(resultElement.elementName);
        } else {
          this.isLoading = false;
        }
      } else {
        this.validatedElement = resultElement;
        this.isLoading = false;
      }
    } catch (error) {
      this.hasErrors = true;
      this.errorList = [{ customError: 'Error de comunicación con el servidor.' }];
      console.error('Error durante la validación:', error);
      this.messageService.add({
        severity: SlbSeverity.Error,
        summary: 'Error en el servidor',
        detail: 'No se pudo completar la validación.',
      });
      this.isLoading = false;
    }
  }
  private fetchElementDetails(elementName: string): void {
    this.catalogService.getStandardElements(elementName, this.idBusinessLine).subscribe({
      next: res => {
        const groupedData = groupElementsByName(res.data);
        if (groupedData && groupedData.length > 0) {
          this.matchedElementGroup = groupedData[0];
        } else {
          this.errorList.push({
            customError: `No se pudieron cargar los detalles para el elemento base '${elementName}'.`,
          });
        }
        this.isLoading = false;
      },
      error: err => {
        console.error('Error al obtener los detalles del elemento:', err);
        this.errorList.push({
          customError: 'Ocurrió un error al cargar los detalles del elemento.',
        });
        this.isLoading = false;
      },
    });
  }
}